-- Handles every client request that spends or claims something. All rules
-- live in Shared.Progression; this file only validates types, applies the
-- action to the player's profile and pushes fresh state back.

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage.Shared
local Progression = require(Shared.Progression)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)
local GameService = require(script.Parent.GameService)
local MonetizationService = require(script.Parent.MonetizationService)

local ShopService = {}

local RATE_WINDOW, RATE_MAX = 1, 8
local recent = {} -- [Player] = { windowStart, count }

local actions = {}

function actions.BuyUpgrade(player, profile, name)
	if type(name) ~= "string" then
		return false, "Bad request"
	end
	return Progression.buyUpgrade(profile, name)
end

function actions.UnlockStage(player, profile, index)
	if type(index) ~= "number" then
		return false, "Bad request"
	end
	local ok, err = Progression.unlockStage(profile, index)
	if ok then
		GameService.setStage(player, profile.currentStage)
	end
	return ok, err
end

function actions.SelectStage(player, profile, index)
	local ok, err = Progression.selectStage(profile, index)
	if ok then
		local session = GameService.session(player)
		if session then
			session.streak = 0 -- switching stages ends the streak
		end
		GameService.setStage(player, profile.currentStage)
	end
	return ok, err
end

function actions.Rebirth(player, profile)
	local ok, err = Progression.rebirth(profile)
	if ok then
		local session = GameService.session(player)
		if session then
			session.streak = 0
		end
		GameService.setStage(player, profile.currentStage)
		GameService.applyCosmetics(player)
		DataService.save(player, false)
	end
	return ok, err
end

function actions.BuyCosmetic(player, profile, category, id)
	if type(category) ~= "string" or type(id) ~= "string" then
		return false, "Bad request"
	end
	return Progression.buyCosmetic(profile, MonetizationService.passes(player), category, id)
end

function actions.Equip(player, profile, category, id, slot)
	if type(category) ~= "string" or type(id) ~= "string" or (slot ~= nil and type(slot) ~= "string") then
		return false, "Bad request"
	end
	local ok, err = Progression.equip(profile, MonetizationService.passes(player), category, id, slot)
	if ok then
		GameService.applyCosmetics(player)
	end
	return ok, err
end

function actions.ClaimDaily(player, profile)
	local ok, reward, day = Progression.claimDaily(profile, os.time())
	if not ok then
		return false, reward
	end
	return true, string.format("Day %d reward: +%d coins!", day, reward)
end

-- Extra actions registered by other services (e.g. duels).
function ShopService.register(name, fn)
	actions[name] = fn
end

local function onRequest(player, action, ...)
	local now = os.clock()
	local r = recent[player]
	if not r or now - r[1] > RATE_WINDOW then
		r = { now, 0 }
		recent[player] = r
	end
	r[2] = r[2] + 1
	if r[2] > RATE_MAX then
		return { ok = false, error = "Slow down" }
	end

	local profile = DataService.get(player)
	local handler = type(action) == "string" and actions[action]
	if not profile or not handler then
		return { ok = false, error = "Unavailable" }
	end
	local ok, info = handler(player, profile, ...)
	GameService.pushState(player)
	if ok then
		return { ok = true, message = type(info) == "string" and info or nil }
	end
	return { ok = false, error = info or "Failed" }
end

function ShopService.start()
	Net.Request.OnServerInvoke = onRequest
	game:GetService("Players").PlayerRemoving:Connect(function(player)
		recent[player] = nil
	end)
end

return ShopService
