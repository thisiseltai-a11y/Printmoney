-- Gamepasses and developer products.
--
-- IDs live in Config.GamePasses / Config.DevProducts; an Id of 0 disables the
-- item. There are no random crates or spins: every purchase gives a fixed,
-- listed reward, so no odds disclosure is needed. If you add paid random
-- rewards later, Roblox policy requires showing the odds before purchase.

local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")

local Config = require(game:GetService("ReplicatedStorage").Shared.Config)
local DataService = require(script.Parent.DataService)

local MonetizationService = {}
MonetizationService.Changed = Instance.new("BindableEvent") -- fires (player) when passes/coins change

local ownedPasses = {} -- [Player] = { [passKey] = true }

local function passKeyForId(id)
	for key, pass in pairs(Config.GamePasses) do
		if pass.Id ~= 0 and pass.Id == id then
			return key
		end
	end
	return nil
end

function MonetizationService.passes(player)
	return ownedPasses[player] or {}
end

function MonetizationService.hasPass(player, key)
	return MonetizationService.passes(player)[key] == true
end

local function refreshPasses(player)
	local owned = {}
	for key, pass in pairs(Config.GamePasses) do
		if pass.Id ~= 0 then
			local ok, has = pcall(MarketplaceService.UserOwnsGamePassAsync, MarketplaceService, player.UserId, pass.Id)
			if ok and has then
				owned[key] = true
			end
		end
	end
	ownedPasses[player] = owned
end

local productsById = {}
for _, product in ipairs(Config.DevProducts) do
	if product.Id ~= 0 then
		productsById[product.Id] = product
	end
end

local function grantProduct(player, profile, product)
	if product.Coins then
		profile.coins = profile.coins + product.Coins
	end
	if product.BoostShots then
		profile.boostShots = (profile.boostShots or 0) + product.BoostShots
	end
end

-- Must be idempotent: Roblox may call this more than once for one purchase.
local function processReceipt(receipt)
	local player = Players:GetPlayerByUserId(receipt.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	local profile = DataService.get(player)
	local product = productsById[receipt.ProductId]
	if not profile or not product then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	for _, id in ipairs(profile.receipts) do
		if id == receipt.PurchaseId then
			return Enum.ProductPurchaseDecision.PurchaseGranted
		end
	end

	grantProduct(player, profile, product)
	table.insert(profile.receipts, receipt.PurchaseId)
	while #profile.receipts > 50 do
		table.remove(profile.receipts, 1)
	end

	-- Persist before acknowledging so a crash can't lose a paid grant.
	if not DataService.save(player, false) then
		-- Roll back; Roblox will retry the receipt later.
		table.remove(profile.receipts)
		if product.Coins then
			profile.coins = profile.coins - product.Coins
		end
		if product.BoostShots then
			profile.boostShots = profile.boostShots - product.BoostShots
		end
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	MonetizationService.Changed:Fire(player, "Thanks! " .. product.Name .. " added.")
	return Enum.ProductPurchaseDecision.PurchaseGranted
end

function MonetizationService.start()
	MarketplaceService.ProcessReceipt = processReceipt

	MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
		local key = passKeyForId(passId)
		if purchased and key then
			ownedPasses[player] = ownedPasses[player] or {}
			ownedPasses[player][key] = true
			MonetizationService.Changed:Fire(player, Config.GamePasses[key].Name .. " unlocked!")
		end
	end)

	Players.PlayerAdded:Connect(refreshPasses)
	for _, player in ipairs(Players:GetPlayers()) do
		task.spawn(refreshPasses, player)
	end
	Players.PlayerRemoving:Connect(function(player)
		ownedPasses[player] = nil
	end)
end

return MonetizationService
