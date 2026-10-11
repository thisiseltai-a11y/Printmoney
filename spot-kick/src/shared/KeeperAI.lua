-- Keeper AI as simple rules + weighted odds, so it is easy to tune from Config.
--
-- 1. Pick a zone to dive to with weighted random odds:
--      every zone starts at weight 1
--      + Lean on the keeper's favourite side (early keepers)
--      + LearnRate * how often you've shot at that zone recently (later keepers)
--      + StayWeight on the centre-low zone (keeper stays put)
-- 2. After the keeper commits, check whether the ball is within reach. Reach
--    grows if the shot is slow enough for the keeper to react and adjust, and
--    shrinks a little for curved shots (harder to read).
--
-- Pure Lua: no Roblox APIs.

local Config = require(script.Parent.Config)
local ShotMath = require(script.Parent.ShotMath)

local KeeperAI = {}

-- Per-player memory. `lean` is -1 (left) or 1 (right), chosen once per session.
function KeeperAI.newMemory(rng)
	local counts = {}
	for i = 1, #ShotMath.Zones do
		counts[i] = 0
	end
	return {
		counts = counts,
		lean = (rng() < 0.5) and -1 or 1,
	}
end

function KeeperAI.remember(memory, zoneIndex)
	local decay = Config.KeeperMemoryDecay
	for i = 1, #memory.counts do
		memory.counts[i] = memory.counts[i] * decay
	end
	memory.counts[zoneIndex] = memory.counts[zoneIndex] + 1
end

function KeeperAI.weights(keeper, memory)
	local weights = {}
	for i, zone in ipairs(ShotMath.Zones) do
		local w = 1
		if keeper.Lean > 0 then
			if (memory.lean < 0 and zone.X < 0) or (memory.lean > 0 and zone.X > 0) then
				w = w + keeper.Lean
			end
		end
		w = w + keeper.LearnRate * memory.counts[i]
		if zone.Id == "LowCenter" then
			w = w + keeper.StayWeight
		end
		weights[i] = w
	end
	return weights
end

function KeeperAI.pickZone(keeper, memory, rng)
	local weights = KeeperAI.weights(keeper, memory)
	local total = 0
	for _, w in ipairs(weights) do
		total = total + w
	end
	local roll = rng() * total
	for i, w in ipairs(weights) do
		roll = roll - w
		if roll <= 0 then
			return i
		end
	end
	return #weights
end

-- Effective reach in studs for a given shot.
function KeeperAI.effectiveReach(keeper, shot)
	local reactWindow = math.max(0, shot.travelTime - keeper.Reaction)
	local adjust = reactWindow * keeper.AdjustSpeed
	-- Curve makes the late adjustment less effective (up to 60% at max curve).
	if shot.curve ~= 0 then
		adjust = adjust * (1 - 0.6 * shot.curveAmount)
	end
	return keeper.Reach + adjust
end

-- Decide the keeper's dive and whether it saves the shot.
-- Returns { zone, diveX, diveY (normalized), saved, distance, reach }
function KeeperAI.decide(keeper, memory, shot, rng)
	local zoneIndex = KeeperAI.pickZone(keeper, memory, rng)
	local zone = ShotMath.Zones[zoneIndex]

	local result = {
		zone = zoneIndex,
		diveX = zone.X,
		diveY = zone.Y,
		saved = false,
		distance = math.huge,
		reach = KeeperAI.effectiveReach(keeper, shot),
	}

	if shot.outcome == "OnTarget" then
		local bx, by = ShotMath.toStuds(shot.x, shot.y)
		local kx, ky = ShotMath.toStuds(zone.X, zone.Y)
		local dx, dy = bx - kx, by - ky
		result.distance = math.sqrt(dx * dx + dy * dy)
		result.saved = result.distance <= result.reach
		if result.saved then
			-- Visually, the keeper ends up at the ball.
			result.diveX = shot.x
			result.diveY = shot.y
		end
	end

	-- Keeper learns from every shot, even misses, using where you aimed.
	KeeperAI.remember(memory, ShotMath.zoneOf(ShotMath.clamp(shot.x, -1, 1), ShotMath.clamp(shot.y, 0, 1)))
	return result
end

return KeeperAI
