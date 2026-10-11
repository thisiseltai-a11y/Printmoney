-- Central tuning table. Every number a designer might want to tweak lives here,
-- so balancing never means hunting through gameplay code.
--
-- This module is plain Lua (no Roblox APIs) so the pure gameplay modules that
-- read it can be unit-tested outside Studio (see tests/run_tests.py).

local Config = {}

Config.GameName = "Spot Kick Streak"

-- Goal geometry in studs. Aim coordinates are normalized: x in [-1, 1]
-- (left post to right post), y in [0, 1] (ground to crossbar).
Config.Goal = {
	HalfWidth = 12,
	Height = 8,
	PostMargin = 0.06, -- normalized distance outside the frame that counts as "hit the post"
}

Config.Shot = {
	Distance = 38, -- studs from the spot to the goal line
	MinSpeed = 55, -- studs/sec at zero power
	BaseMaxSpeed = 95, -- studs/sec at full power with no Power upgrades
	SweetSpot = 0.85, -- power above this starts adding spread ("blasting it")
	OverchargeSpread = 1.6, -- extra spread per unit of power above the sweet spot
	BaseSpread = 0.22, -- normalized radius of random error at 0 Accuracy
	MinSpread = 0.04,
	ChargePeriod = 1.4, -- seconds for the power meter to go 0 -> 1 -> 0 (ping-pong)
	Cooldown = 1.2, -- server-side minimum seconds between shots
	MaxCurveBend = 3.5, -- studs of sideways bend at full Curve upgrade
}

-- Keeper difficulty per stage. All keeper behaviour is weighted odds plus a
-- reach check, so these knobs are the whole AI:
--   Reach       studs the keeper covers from the centre of the zone they dive to
--   Reaction    seconds before the keeper can adjust after the ball is struck
--   AdjustSpeed studs/sec the keeper can shift toward the ball after reacting
--   Lean        extra weight added to one side (picked per session) for early keepers
--   LearnRate   how strongly the keeper weights zones you have shot at before
--   StayWeight  weight for standing in the middle (centre-low zone)
Config.Stages = {
	{
		Id = "Park",
		Name = "Park",
		Payout = 10,
		UnlockCost = 0,
		Keeper = { Reach = 2.6, Reaction = 0.55, AdjustSpeed = 5, Lean = 0.6, LearnRate = 0, StayWeight = 0.6 },
		KitColor = { 90, 160, 90 },
	},
	{
		Id = "Street",
		Name = "Street",
		Payout = 25,
		UnlockCost = 1500,
		Keeper = { Reach = 3.0, Reaction = 0.45, AdjustSpeed = 7, Lean = 0.3, LearnRate = 0.5, StayWeight = 0.5 },
		KitColor = { 200, 120, 40 },
	},
	{
		Id = "Stadium",
		Name = "Stadium",
		Payout = 60,
		UnlockCost = 12000,
		Keeper = { Reach = 3.7, Reaction = 0.38, AdjustSpeed = 9, Lean = 0.1, LearnRate = 1.0, StayWeight = 0.4 },
		KitColor = { 60, 90, 200 },
	},
	{
		Id = "Final",
		Name = "Final",
		Payout = 150,
		UnlockCost = 80000,
		Keeper = { Reach = 4.3, Reaction = 0.30, AdjustSpeed = 11, Lean = 0, LearnRate = 1.6, StayWeight = 0.3 },
		KitColor = { 200, 40, 60 },
	},
}

-- How quickly old shots fade from the keeper's memory (multiplied in per shot).
Config.KeeperMemoryDecay = 0.8

-- Streak multiplier: 1 + streak * Step, capped.
Config.Streak = {
	Step = 0.2,
	MaxMultiplier = 5,
}

-- Coin upgrades. Cost of the next level = BaseCost * Growth ^ currentLevel.
Config.Upgrades = {
	Power = { Order = 1, Name = "Power", MaxLevel = 20, BaseCost = 50, Growth = 1.35, PerLevel = 2.5,
		Description = "Faster shots give the keeper less time to react." },
	Accuracy = { Order = 2, Name = "Accuracy", MaxLevel = 20, BaseCost = 60, Growth = 1.35, PerLevel = 0.045,
		Description = "Shots land closer to where you aimed." },
	Curve = { Order = 3, Name = "Curve", MaxLevel = 15, BaseCost = 120, Growth = 1.4, PerLevel = 1 / 15,
		Description = "Bend the ball. Curved shots are harder for the keeper to read." },
	CoinMult = { Order = 4, Name = "Coin Multiplier", MaxLevel = 25, BaseCost = 100, Growth = 1.45, PerLevel = 0.1,
		Description = "+10% coins per level." },
}

Config.Rebirth = {
	BaseCost = 150000, -- coins needed for the first rebirth
	CostGrowth = 2.5,
	RequiredStage = 4, -- must have unlocked the Final
	MultiplierPerRebirth = 0.5, -- permanent coin multiplier = 1 + rebirths * this
}

Config.Daily = {
	CooldownHours = 20, -- claimable again after this long
	ResetHours = 48, -- miss the window for this long and the day streak resets
	Rewards = { 100, 200, 350, 500, 800, 1200, 2500 }, -- day 1..7, day 7 repeats
}

Config.Duel = {
	ShotsEach = 5,
	WinReward = 500,
	ParticipationReward = 100,
	TurnTimeout = 20, -- seconds before a turn is auto-taken as a miss
	StageIndex = 2, -- keeper difficulty used for duels
}

-- Monetization. Set these to your real IDs from the Creator Dashboard. An ID of
-- 0 disables that item (the UI hides it) so the game runs before you publish.
Config.GamePasses = {
	DoubleCoins = { Id = 0, Name = "2x Coins" },
	VipTrail = { Id = 0, Name = "VIP Trail" },
	ExtraSlot = { Id = 0, Name = "Extra Celebration Slot" },
}

Config.DevProducts = {
	{ Key = "CoinsSmall", Id = 0, Name = "Bag of Coins", Coins = 2500 },
	{ Key = "CoinsMedium", Id = 0, Name = "Chest of Coins", Coins = 15000 },
	{ Key = "CoinsLarge", Id = 0, Name = "Vault of Coins", Coins = 100000 },
	{ Key = "StreakBoost", Id = 0, Name = "Streak Boost", BoostShots = 10, BoostMultiplier = 2 },
}

-- Sound asset IDs (rbxassetid numbers). 0 = silent. Upload or pick licensed
-- sounds from the Creator Store and paste their IDs here.
Config.Sounds = {
	Kick = 0,
	Goal = 0,
	Save = 0,
	Post = 0,
	CrowdLoop = 0,
	CrowdCheer = 0,
	CrowdGroan = 0,
}

Config.Arena = {
	PitchCount = 8, -- how many players can shoot at once (one pitch each)
	PitchSpacing = 70,
	Origin = { 0, 0, 0 },
}

return Config
