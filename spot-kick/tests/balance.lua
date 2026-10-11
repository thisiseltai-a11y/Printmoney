-- Prints keeper save rates per stage for a few player archetypes so tuning
-- changes in Config can be sanity-checked numerically.
local Config = require({ __module = "Config" })
local ShotMath = require({ __module = "ShotMath" })
local KeeperAI = require({ __module = "KeeperAI" })

local rng = SeededRng(7)
local N = 4000

local archetypes = {
	{ name = "fresh, corners", levels = { Power = 0, Accuracy = 0, Curve = 0 }, aim = function() return (rng() < 0.5 and -0.75 or 0.75), (rng() < 0.5 and 0.25 or 0.75) end },
	{ name = "fresh, spams TL", levels = { Power = 0, Accuracy = 0, Curve = 0 }, aim = function() return -0.75, 0.75 end },
	{ name = "mid upgrades, mixed", levels = { Power = 8, Accuracy = 8, Curve = 6 }, aim = function() return rng() * 1.6 - 0.8, rng() * 0.7 + 0.15 end },
	{ name = "maxed, corners", levels = { Power = 20, Accuracy = 20, Curve = 15 }, aim = function() return (rng() < 0.5 and -0.85 or 0.85), (rng() < 0.5 and 0.2 or 0.82) end },
}

print(string.format("%-22s %8s %8s %8s %8s", "archetype \\ stage", "Park", "Street", "Stadium", "Final"))
for _, a in ipairs(archetypes) do
	local row = {}
	for s, stage in ipairs(Config.Stages) do
		local memory = KeeperAI.newMemory(rng)
		local goals = 0
		for _ = 1, N do
			local ax, ay = a.aim()
			local shot = ShotMath.resolve({ aimX = ax, aimY = ay, power = 0.6 + rng() * 0.3, curve = (rng() < 0.5) and 1 or -1 }, a.levels, rng)
			local k = KeeperAI.decide(stage.Keeper, memory, shot, rng)
			if shot.outcome == "OnTarget" and not k.saved then
				goals = goals + 1
			end
		end
		row[s] = string.format("%7.0f%%", goals / N * 100)
	end
	print(string.format("%-22s %s %s %s %s", a.name, row[1], row[2], row[3], row[4]))
end
