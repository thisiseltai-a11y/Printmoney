-- Pure progression rules: profile shape, prices, multipliers and every
-- coin-spending action. The server calls these and then saves; the client
-- uses the same functions to show prices, so both always agree.
--
-- Each action returns `true` on success or `false, reason` and only mutates
-- the profile on success.

local Config = require(script.Parent.Config)
local Cosmetics = require(script.Parent.Cosmetics)

local Progression = {}

Progression.SchemaVersion = 1

function Progression.newProfile()
	local owned, equipped = {}, {}
	for _, category in ipairs(Cosmetics.Categories) do
		local id = Cosmetics.default(category)
		owned[category] = { [id] = true }
		equipped[category] = id
	end
	return {
		version = Progression.SchemaVersion,
		coins = 0,
		totalGoals = 0,
		totalShots = 0,
		bestStreak = 0,
		upgrades = { Power = 0, Accuracy = 0, Curve = 0, CoinMult = 0 },
		stageUnlocked = 1,
		currentStage = 1,
		rebirths = 0,
		owned = owned,
		equipped = equipped,
		daily = { lastClaim = 0, dayStreak = 0 },
		boostShots = 0,
		dailyBest = { day = "", streak = 0 },
		receipts = {}, -- recent PurchaseIds, for idempotent ProcessReceipt
	}
end

-- Fill in anything missing from an older or partial save.
function Progression.reconcile(profile)
	local fresh = Progression.newProfile()
	if type(profile) ~= "table" then
		return fresh
	end
	for key, value in pairs(fresh) do
		if profile[key] == nil then
			profile[key] = value
		elseif type(value) == "table" and type(profile[key]) == "table" then
			for k, v in pairs(value) do
				if profile[key][k] == nil then
					profile[key][k] = v
				end
			end
		end
	end
	profile.version = Progression.SchemaVersion
	return profile
end

-- Prices & multipliers ------------------------------------------------------

function Progression.upgradeCost(name, level)
	local def = Config.Upgrades[name]
	if not def or level >= def.MaxLevel then
		return nil
	end
	return math.floor(def.BaseCost * def.Growth ^ level + 0.5)
end

function Progression.streakMultiplier(streak)
	return math.min(1 + streak * Config.Streak.Step, Config.Streak.MaxMultiplier)
end

function Progression.rebirthMultiplier(rebirths)
	return 1 + (rebirths or 0) * Config.Rebirth.MultiplierPerRebirth
end

function Progression.rebirthCost(rebirths)
	return math.floor(Config.Rebirth.BaseCost * Config.Rebirth.CostGrowth ^ (rebirths or 0) + 0.5)
end

-- Everything except the streak: upgrades, rebirths, gamepass, boost.
-- opts = { doubleCoins = bool, boostMultiplier = number? }
function Progression.baseMultiplier(profile, opts)
	opts = opts or {}
	local m = 1 + Config.Upgrades.CoinMult.PerLevel * profile.upgrades.CoinMult
	m = m * Progression.rebirthMultiplier(profile.rebirths)
	if opts.doubleCoins then
		m = m * 2
	end
	if opts.boostMultiplier then
		m = m * opts.boostMultiplier
	end
	return m
end

function Progression.coinsForGoal(profile, stageIndex, streak, opts)
	local stage = Config.Stages[stageIndex]
	local total = stage.Payout * Progression.streakMultiplier(streak) * Progression.baseMultiplier(profile, opts)
	return math.floor(total + 0.5)
end

-- Actions -------------------------------------------------------------------

function Progression.buyUpgrade(profile, name)
	if not Config.Upgrades[name] then
		return false, "Unknown upgrade"
	end
	local level = profile.upgrades[name] or 0
	local cost = Progression.upgradeCost(name, level)
	if not cost then
		return false, "Already maxed"
	end
	if profile.coins < cost then
		return false, "Not enough coins"
	end
	profile.coins = profile.coins - cost
	profile.upgrades[name] = level + 1
	return true
end

function Progression.unlockStage(profile, index)
	local stage = Config.Stages[index]
	if not stage then
		return false, "Unknown stage"
	end
	if index <= profile.stageUnlocked then
		return false, "Already unlocked"
	end
	if index ~= profile.stageUnlocked + 1 then
		return false, "Unlock the previous stage first"
	end
	if profile.coins < stage.UnlockCost then
		return false, "Not enough coins"
	end
	profile.coins = profile.coins - stage.UnlockCost
	profile.stageUnlocked = index
	profile.currentStage = index
	return true
end

function Progression.selectStage(profile, index)
	if type(index) ~= "number" or not Config.Stages[index] then
		return false, "Unknown stage"
	end
	if index > profile.stageUnlocked then
		return false, "Stage locked"
	end
	profile.currentStage = index
	return true
end

function Progression.canRebirth(profile)
	if profile.stageUnlocked < Config.Rebirth.RequiredStage then
		return false, "Unlock the " .. Config.Stages[Config.Rebirth.RequiredStage].Name .. " first"
	end
	if profile.coins < Progression.rebirthCost(profile.rebirths) then
		return false, "Not enough coins"
	end
	return true
end

-- Rebirth resets coins, upgrades and stages; keeps cosmetics, stats and purchases.
function Progression.rebirth(profile)
	local ok, err = Progression.canRebirth(profile)
	if not ok then
		return false, err
	end
	profile.rebirths = profile.rebirths + 1
	profile.coins = 0
	for name in pairs(profile.upgrades) do
		profile.upgrades[name] = 0
	end
	profile.stageUnlocked = 1
	profile.currentStage = 1
	return true
end

function Progression.buyCosmetic(profile, passes, category, id)
	local item = Cosmetics.get(category, id)
	if not item then
		return false, "Unknown item"
	end
	if Cosmetics.isOwned(profile, passes, category, id) then
		return false, "Already owned"
	end
	local price = item.Unlock.Coins
	if not price then
		return false, "Not for sale"
	end
	if profile.coins < price then
		return false, "Not enough coins"
	end
	profile.coins = profile.coins - price
	profile.owned[category][id] = true
	return true
end

-- slot is "Celebration2" for the extra celebration slot gamepass, else nil.
function Progression.equip(profile, passes, category, id, slot)
	if not Cosmetics.get(category, id) then
		return false, "Unknown item"
	end
	if not Cosmetics.isOwned(profile, passes, category, id) then
		return false, "Not owned"
	end
	if slot == "Celebration2" then
		if category ~= "Celebration" then
			return false, "Wrong slot"
		end
		if not (passes and passes.ExtraSlot) then
			return false, "Requires the Extra Celebration Slot pass"
		end
		profile.equipped.Celebration2 = id
		return true
	end
	profile.equipped[category] = id
	return true
end

-- Daily rewards ---------------------------------------------------------------

-- Returns canClaim, rewardCoins, dayNumber (1-based), secondsUntilClaimable
function Progression.dailyStatus(profile, now)
	local d = profile.daily
	local elapsed = now - (d.lastClaim or 0)
	local cooldown = Config.Daily.CooldownHours * 3600
	local day = d.dayStreak + 1
	if d.lastClaim == 0 or elapsed > Config.Daily.ResetHours * 3600 then
		day = 1
	end
	local rewards = Config.Daily.Rewards
	local reward = rewards[math.min(day, #rewards)]
	if elapsed >= cooldown or d.lastClaim == 0 then
		return true, reward, day, 0
	end
	return false, reward, day, cooldown - elapsed
end

function Progression.claimDaily(profile, now)
	local canClaim, reward, day = Progression.dailyStatus(profile, now)
	if not canClaim then
		return false, "Come back later"
	end
	profile.daily.lastClaim = now
	profile.daily.dayStreak = day
	profile.coins = profile.coins + reward
	return true, reward, day
end

-- UTC day key used by the daily streak leaderboard, e.g. "20261011".
function Progression.dayKey(now)
	return os.date("!%Y%m%d", now)
end

-- Record a streak for today's leaderboard. Returns true if it is a new daily best.
function Progression.recordDailyStreak(profile, streak, now)
	local key = Progression.dayKey(now)
	if profile.dailyBest.day ~= key then
		profile.dailyBest.day = key
		profile.dailyBest.streak = 0
	end
	if streak > profile.dailyBest.streak then
		profile.dailyBest.streak = streak
		return true
	end
	return false
end

return Progression
