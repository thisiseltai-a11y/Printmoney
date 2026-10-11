-- Pure shot resolution: turns player input + upgrade levels into where the
-- ball actually goes and how fast. No Roblox APIs, so it is unit-testable.
--
-- `rng` is any function returning a uniform float in [0, 1). On the server pass
-- a wrapper around Random.new():NextNumber(); in tests pass a seeded generator.

local Config = require(script.Parent.Config)

local ShotMath = {}

local function clamp(v, lo, hi)
	if v ~= v then -- NaN
		return lo
	end
	if v < lo then
		return lo
	end
	if v > hi then
		return hi
	end
	return v
end
ShotMath.clamp = clamp

-- Zones are a 3x2 grid: columns L/C/R, rows Low/High. Index = row * 3 + col + 1.
ShotMath.Zones = {
	{ Id = "LowLeft", X = -2 / 3, Y = 0.25 },
	{ Id = "LowCenter", X = 0, Y = 0.25 },
	{ Id = "LowRight", X = 2 / 3, Y = 0.25 },
	{ Id = "HighLeft", X = -2 / 3, Y = 0.72 },
	{ Id = "HighCenter", X = 0, Y = 0.72 },
	{ Id = "HighRight", X = 2 / 3, Y = 0.72 },
}

function ShotMath.zoneOf(x, y)
	local col
	if x < -1 / 3 then
		col = 0
	elseif x > 1 / 3 then
		col = 2
	else
		col = 1
	end
	local row = (y > 0.5) and 1 or 0
	return row * 3 + col + 1
end

-- Convert normalized goal coordinates to studs relative to the bottom-centre
-- of the goal mouth.
function ShotMath.toStuds(x, y)
	return x * Config.Goal.HalfWidth, y * Config.Goal.Height
end

function ShotMath.upgradeValue(name, level)
	return Config.Upgrades[name].PerLevel * (level or 0)
end

function ShotMath.speedFor(power, powerLevel)
	local maxSpeed = Config.Shot.BaseMaxSpeed + ShotMath.upgradeValue("Power", powerLevel)
	return Config.Shot.MinSpeed + (maxSpeed - Config.Shot.MinSpeed) * power
end

function ShotMath.spreadFor(power, accuracyLevel)
	local base = Config.Shot.BaseSpread * (1 - ShotMath.upgradeValue("Accuracy", accuracyLevel))
	base = math.max(Config.Shot.MinSpread, base)
	local over = math.max(0, power - Config.Shot.SweetSpot)
	return base * (1 + over * Config.Shot.OverchargeSpread / (1 - Config.Shot.SweetSpot))
end

-- input:  { aimX, aimY, power, curve } where curve is -1 (bend left), 0, or 1 (bend right)
-- levels: { Power, Accuracy, Curve }
-- returns { x, y, power, speed, travelTime, curve, bend, outcome = "OnTarget" | "Post" | "Miss" }
function ShotMath.resolve(input, levels, rng)
	levels = levels or {}
	local aimX = clamp(tonumber(input.aimX) or 0, -1.2, 1.2)
	local aimY = clamp(tonumber(input.aimY) or 0.3, 0, 1.2)
	local power = clamp(tonumber(input.power) or 0, 0, 1)
	local curveDir = clamp(math.floor((tonumber(input.curve) or 0) + 0.5), -1, 1)

	-- Random error inside a disk (uniform by area).
	local spread = ShotMath.spreadFor(power, levels.Accuracy)
	local angle = rng() * math.pi * 2
	local radius = spread * math.sqrt(rng())
	-- The goal is 3:1 wide, so scale vertical error to match stud distance.
	local aspect = Config.Goal.HalfWidth / Config.Goal.Height
	local x = aimX + math.cos(angle) * radius
	local y = aimY + math.sin(angle) * radius * aspect

	-- A weak shot drops: below ~35% power the ball loses height.
	if power < 0.35 then
		y = y * (0.5 + power / 0.7)
	end
	y = math.max(0.03, y)

	local speed = ShotMath.speedFor(power, levels.Power)
	local curveAmount = ShotMath.upgradeValue("Curve", levels.Curve)
	local bend = curveDir * curveAmount * Config.Shot.MaxCurveBend

	local outcome = "OnTarget"
	local margin = Config.Goal.PostMargin
	if math.abs(x) > 1 + margin or y > 1 + margin then
		outcome = "Miss"
	elseif math.abs(x) > 1 or y > 1 then
		outcome = "Post"
	end

	return {
		x = x,
		y = y,
		power = power,
		speed = speed,
		travelTime = Config.Shot.Distance / speed,
		curve = curveDir,
		curveAmount = curveAmount,
		bend = bend,
		outcome = outcome,
	}
end

return ShotMath
