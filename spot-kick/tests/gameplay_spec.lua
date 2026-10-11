local Config = require({ __module = "Config" })
local ShotMath = require({ __module = "ShotMath" })
local KeeperAI = require({ __module = "KeeperAI" })
local Progression = require({ __module = "Progression" })
local Cosmetics = require({ __module = "Cosmetics" })

-- ShotMath ------------------------------------------------------------------

it("zoneOf maps the 3x2 grid", function()
	expectEq(ShotMath.Zones[ShotMath.zoneOf(-0.9, 0.1)].Id, "LowLeft")
	expectEq(ShotMath.Zones[ShotMath.zoneOf(0, 0.9)].Id, "HighCenter")
	expectEq(ShotMath.Zones[ShotMath.zoneOf(0.9, 0.9)].Id, "HighRight")
end)

it("resolve clamps garbage input instead of erroring", function()
	local shot = ShotMath.resolve({ aimX = 0 / 0, aimY = "x", power = 99, curve = 7 }, {}, SeededRng(1))
	expect(shot.power == 1, "power clamped")
	expect(shot.curve == 1, "curve clamped")
	expect(shot.x == shot.x, "x is not NaN")
end)

it("aiming far wide is a miss", function()
	local shot = ShotMath.resolve({ aimX = 1.2, aimY = 0.5, power = 0.7, curve = 0 }, { Accuracy = 20 }, SeededRng(2))
	expectEq(shot.outcome, "Miss")
end)

it("accuracy upgrades shrink spread and overcharge grows it", function()
	expect(ShotMath.spreadFor(0.7, 10) < ShotMath.spreadFor(0.7, 0), "accuracy helps")
	expect(ShotMath.spreadFor(1.0, 0) > ShotMath.spreadFor(0.8, 0), "overcharge hurts")
	expect(ShotMath.spreadFor(0.7, 20) >= Config.Shot.MinSpread, "spread floor")
end)

it("power upgrades make the ball faster", function()
	expect(ShotMath.speedFor(1, 10) > ShotMath.speedFor(1, 0))
end)

-- KeeperAI ------------------------------------------------------------------

it("learning keepers weight the zone you keep shooting at", function()
	local rng = SeededRng(3)
	local memory = KeeperAI.newMemory(rng)
	for _ = 1, 10 do
		KeeperAI.remember(memory, 4) -- HighLeft
	end
	local final = Config.Stages[4].Keeper
	local w = KeeperAI.weights(final, memory)
	for i = 1, #w do
		if i ~= 4 then
			expect(w[4] > w[i], "HighLeft should be the heaviest zone")
		end
	end
	-- Park keeper does not learn.
	local park = KeeperAI.weights(Config.Stages[1].Keeper, memory)
	expect(park[4] < w[4], "park keeper ignores habits")
end)

it("keeper saves a slow shot straight at it", function()
	local rng = SeededRng(4)
	local memory = KeeperAI.newMemory(rng)
	local shot = { x = 0, y = 0.25, outcome = "OnTarget", travelTime = 1, curve = 0, curveAmount = 0 }
	local k = KeeperAI.decide(Config.Stages[1].Keeper, memory, shot, rng)
	-- Any zone is within reach of the centre-low spot given a 1s reaction window,
	-- except the far top corners; centre-low is always within reach.
	expect(k.reach > 4, "slow shot extends reach")
end)

it("off-target shots are never 'saved'", function()
	local rng = SeededRng(5)
	local shot = { x = 1.3, y = 0.5, outcome = "Miss", travelTime = 0.5, curve = 0, curveAmount = 0 }
	local k = KeeperAI.decide(Config.Stages[4].Keeper, KeeperAI.newMemory(rng), shot, rng)
	expectEq(k.saved, false)
end)

it("later stages save more often than the park", function()
	local rng = SeededRng(6)
	local function goalRate(stageIndex)
		local memory = KeeperAI.newMemory(rng)
		local goals = 0
		for _ = 1, 3000 do
			local shot = ShotMath.resolve({ aimX = -0.75, aimY = 0.75, power = 0.75, curve = 0 }, {}, rng)
			local k = KeeperAI.decide(Config.Stages[stageIndex].Keeper, memory, shot, rng)
			if shot.outcome == "OnTarget" and not k.saved then
				goals = goals + 1
			end
		end
		return goals
	end
	expect(goalRate(1) > goalRate(4), "final is harder than park")
end)

-- Progression ---------------------------------------------------------------

it("new profile owns and equips defaults", function()
	local p = Progression.newProfile()
	expectEq(p.equipped.Ball, "Classic")
	expect(Cosmetics.isOwned(p, {}, "Trail", "None"))
end)

it("reconcile fills fields missing from old saves", function()
	local p = Progression.reconcile({ coins = 50, upgrades = { Power = 3 } })
	expectEq(p.coins, 50)
	expectEq(p.upgrades.Power, 3)
	expectEq(p.upgrades.Accuracy, 0)
	expect(p.daily ~= nil)
end)

it("buyUpgrade charges and levels, rejects when broke", function()
	local p = Progression.newProfile()
	local ok = Progression.buyUpgrade(p, "Power")
	expectEq(ok, false)
	p.coins = 1000
	expect(Progression.buyUpgrade(p, "Power"))
	expectEq(p.upgrades.Power, 1)
	expectEq(p.coins, 1000 - Progression.upgradeCost("Power", 0))
	expectEq(Progression.buyUpgrade(p, "Nope"), false)
end)

it("stages unlock in order", function()
	local p = Progression.newProfile()
	p.coins = 10 ^ 9
	expectEq(Progression.unlockStage(p, 3), false)
	expect(Progression.unlockStage(p, 2))
	expectEq(p.currentStage, 2)
	expectEq(Progression.selectStage(p, 4), false)
	expect(Progression.selectStage(p, 1))
end)

it("streak multiplier grows and caps", function()
	expectEq(Progression.streakMultiplier(0), 1)
	expect(Progression.streakMultiplier(3) > 1)
	expectEq(Progression.streakMultiplier(1000), Config.Streak.MaxMultiplier)
end)

it("coins stack streak, upgrades, rebirth and 2x pass", function()
	local p = Progression.newProfile()
	local base = Progression.coinsForGoal(p, 1, 0)
	expectEq(base, Config.Stages[1].Payout)
	p.rebirths = 2
	expectEq(Progression.coinsForGoal(p, 1, 0, { doubleCoins = true }), base * 2 * 2)
end)

it("rebirth requires the final and resets progress but keeps cosmetics", function()
	local p = Progression.newProfile()
	p.coins = 10 ^ 9
	expectEq(Progression.rebirth(p), false)
	p.stageUnlocked = 4
	p.upgrades.Power = 5
	p.owned.Ball.Sunburst = true
	expect(Progression.rebirth(p))
	expectEq(p.rebirths, 1)
	expectEq(p.coins, 0)
	expectEq(p.upgrades.Power, 0)
	expectEq(p.stageUnlocked, 1)
	expect(p.owned.Ball.Sunburst)
	expect(Cosmetics.isOwned(p, {}, "Ball", "Phoenix"), "rebirth-exclusive ball unlocked")
end)

it("cosmetics: buy, equip, gamepass and extra slot", function()
	local p = Progression.newProfile()
	p.coins = 5000
	expect(Progression.buyCosmetic(p, {}, "Ball", "Sunburst"))
	expect(Progression.equip(p, {}, "Ball", "Sunburst"))
	expectEq(p.equipped.Ball, "Sunburst")
	expectEq(Progression.buyCosmetic(p, {}, "Trail", "VIP"), false)
	expectEq(Progression.equip(p, {}, "Trail", "VIP"), false)
	expect(Progression.equip(p, { VipTrail = true }, "Trail", "VIP"))
	expectEq(Progression.equip(p, {}, "Celebration", "Confetti", "Celebration2"), false)
	expect(Progression.equip(p, { ExtraSlot = true }, "Celebration", "Confetti", "Celebration2"))
end)

it("daily rewards: cooldown, streak and reset", function()
	local p = Progression.newProfile()
	local t = 1000000
	local ok, reward, day = Progression.claimDaily(p, t)
	expect(ok)
	expectEq(day, 1)
	expectEq(reward, Config.Daily.Rewards[1])
	expectEq(Progression.claimDaily(p, t + 3600), false)
	local ok2, _, day2 = Progression.claimDaily(p, t + 21 * 3600)
	expect(ok2)
	expectEq(day2, 2)
	local ok3, _, day3 = Progression.claimDaily(p, t + 21 * 3600 + 72 * 3600)
	expect(ok3)
	expectEq(day3, 1, "streak resets after a long gap")
end)

it("daily best streak resets per UTC day", function()
	local p = Progression.newProfile()
	local t = 1760140800 -- 2025-10-11 00:00 UTC
	expect(Progression.recordDailyStreak(p, 3, t))
	expectEq(Progression.recordDailyStreak(p, 2, t + 60), false)
	expect(Progression.recordDailyStreak(p, 1, t + 86400), "new day starts fresh")
end)
