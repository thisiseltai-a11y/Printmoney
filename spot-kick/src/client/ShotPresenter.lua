-- Animates a server shot result on its pitch: kicker run-up, curved ball
-- flight, keeper dive, and the outcome follow-through. Runs on every client
-- for every pitch so other players' shots are visible too; only the shooter
-- (or a duel spectator) gets the camera, slow motion and celebrations.
--
-- All motion runs on our own clock (`t += dt * timeScale`), which is what
-- makes slow motion possible without touching the physics engine.

local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

local Config = require(game:GetService("ReplicatedStorage").Shared.Config)
local Effects = require(script.Parent.Effects)

local ShotPresenter = {}

local RUNUP = 0.25
local FOLLOW = 1.0
local SLOWMO_SCALE = 0.22

local active = {} -- [pitch] = token

local function easeOut(a)
	return 1 - (1 - a) * (1 - a)
end

local function bezier(p0, p1, p2, a)
	local u = 1 - a
	return p0 * (u * u) + p1 * (2 * u * a) + p2 * (a * a)
end

local function goalPoint(pitch, x, y, depth)
	return (pitch.GoalAnchor.CFrame * CFrame.new(x * Config.Goal.HalfWidth, y * Config.Goal.Height, -(depth or 0))).Position
end

function ShotPresenter.pitchFor(index)
	local arena = Workspace:FindFirstChild("Arena")
	return arena and arena:FindFirstChild("Pitch_" .. tostring(index))
end

function ShotPresenter.reset(pitch)
	active[pitch] = nil
	local ballHome = pitch.Spot.Position + Vector3.new(0, 0.7, 0)
	pitch.Ball.CFrame = CFrame.new(ballHome)
	pitch.Keeper:PivotTo(pitch.Keeper:GetAttribute("HomeCFrame"))
	pitch.Kicker:PivotTo(pitch.Kicker:GetAttribute("HomeCFrame"))
end

-- Idle camera: behind the ball, looking at the goal.
function ShotPresenter.idleCameraCFrame(pitch)
	local spot = pitch.Spot.Position
	local goalCenter = goalPoint(pitch, 0, 0.45, 0)
	local back = (spot - goalCenter) * Vector3.new(1, 0, 1)
	local pos = spot + back.Unit * 11 + Vector3.new(0, 4.5, 0)
	return CFrame.lookAt(pos, goalCenter + Vector3.new(0, 1, 0))
end

-- opts = { camera = bool, celebrate = bool, onImpact = fn(result), onDone = fn(result) }
function ShotPresenter.play(result, opts)
	opts = opts or {}
	local pitch = ShotPresenter.pitchFor(result.pitch)
	if not pitch then
		return
	end
	ShotPresenter.reset(pitch)
	local token = {}
	active[pitch] = token

	local anchor = pitch.GoalAnchor.CFrame
	local into, right, up = anchor.LookVector, anchor.RightVector, Vector3.new(0, 1, 0)
	local ball = pitch.Ball
	local start = ball.Position
	local travel = result.travelTime
	local outcome = result.outcome

	-- Where the ball is headed. Posts get clamped onto the frame.
	local tx, ty = result.x, result.y
	if outcome == "Post" then
		if math.abs(tx) > 1 then
			tx = (tx > 0 and 1 or -1) * 1.01
		end
		ty = math.min(ty, 1.03)
	end
	local target = goalPoint(pitch, tx, ty, 0)
	local loft = 0.6 + math.max(0, ty) * 1.6
	local control = (start + target) / 2 - right * (result.bend or 0) + up * loft

	-- Keeper dive target (root sits at hip height, so drop it a little).
	local keeperHome = pitch.Keeper:GetAttribute("HomeCFrame")
	local diveWorld = goalPoint(pitch, result.keeperX, result.keeperY, -0.8) - Vector3.new(0, 1.2, 0)
	local diveOffset = diveWorld - keeperHome.Position
	diveOffset = Vector3.new(diveOffset.X, math.max(diveOffset.Y, -1.6), diveOffset.Z)
	local sideways = diveOffset:Dot(right)
	local roll = math.clamp(sideways / Config.Goal.HalfWidth, -1, 1) * math.rad(80)
	local keeperDiveStart, keeperDiveEnd = RUNUP + travel * 0.12, RUNUP + travel * 0.95

	local kickerHome = pitch.Kicker:GetAttribute("HomeCFrame")
	local kickerPlant = CFrame.lookAt(start * Vector3.new(1, 0, 1) + Vector3.new(-0.9, kickerHome.Y, 1.3), target * Vector3.new(1, 0, 1) + Vector3.new(0, kickerHome.Y, 0))

	-- Follow-through path after the ball reaches the goal plane.
	local afterPos
	if outcome == "Goal" then
		local netPoint = target + into * 4.2
		afterPos = function(a)
			if a < 0.3 then
				return target:Lerp(netPoint, a / 0.3)
			end
			local f = (a - 0.3) / 0.7
			local ground = Vector3.new(netPoint.X, start.Y, netPoint.Z)
			return netPoint:Lerp(ground, easeOut(f))
		end
	elseif outcome == "Save" then
		local side = (sideways >= 0) and 1 or -1
		local deflect = target - into * 7 + right * side * 5 + up * 2
		afterPos = function(a)
			local p = target:Lerp(deflect, easeOut(a))
			return Vector3.new(p.X, math.max(start.Y, p.Y - 6 * a * a), p.Z)
		end
	elseif outcome == "Post" then
		local bounce = target - into * 9 + right * (tx > 0 and -3 or 3) + up * 1.5
		afterPos = function(a)
			local p = target:Lerp(bounce, easeOut(a))
			return Vector3.new(p.X, math.max(start.Y, p.Y - 5 * a * a), p.Z)
		end
	else
		local dir = (target - start).Unit
		afterPos = function(a)
			return target + dir * 30 * a
		end
	end

	local cam = Workspace.CurrentCamera
	local idleCam = ShotPresenter.idleCameraCFrame(pitch)
	local useSlowmo = opts.camera and (outcome == "Goal" or outcome == "Save")
	local slowFrom, slowTo = RUNUP + travel * 0.72, RUNUP + travel + 0.22
	local impactAt = RUNUP + travel
	local impacted = false
	local finishAt = impactAt + FOLLOW
	local t = 0
	local spin = CFrame.new()

	if opts.camera then
		cam.CameraType = Enum.CameraType.Scriptable
	end

	local conn
	conn = RunService.RenderStepped:Connect(function(dt)
		if active[pitch] ~= token then
			conn:Disconnect()
			return
		end
		local scale = (useSlowmo and t >= slowFrom and t <= slowTo) and SLOWMO_SCALE or 1
		t = t + dt * scale

		-- Kicker run-up and kick.
		if t <= RUNUP then
			local a = easeOut(t / RUNUP)
			pitch.Kicker:PivotTo(kickerHome:Lerp(kickerPlant, a))
		elseif t <= RUNUP + 0.3 then
			local a = (t - RUNUP) / 0.3
			pitch.Kicker:PivotTo(kickerPlant * CFrame.Angles(-math.sin(a * math.pi) * 0.35, 0, 0))
		end

		-- Ball.
		local ballPos
		if t < RUNUP then
			ballPos = start
		elseif t < impactAt then
			local a = (t - RUNUP) / travel
			ballPos = bezier(start, control, target, a)
			spin = spin * CFrame.Angles(-dt * scale * 25, dt * scale * (result.bend or 0) * 4, 0)
		else
			local a = math.clamp((t - impactAt) / (FOLLOW * 0.8), 0, 1)
			ballPos = afterPos(a)
			spin = spin * CFrame.Angles(-dt * scale * 10 * (1 - a), 0, 0)
		end
		ball.CFrame = CFrame.new(ballPos) * spin

		-- Keeper.
		if t >= keeperDiveStart then
			local a = easeOut(math.clamp((t - keeperDiveStart) / (keeperDiveEnd - keeperDiveStart), 0, 1))
			pitch.Keeper:PivotTo(keeperHome * CFrame.new(keeperHome:VectorToObjectSpace(diveOffset * a)) * CFrame.Angles(0, 0, roll * a))
		end

		-- Impact.
		if not impacted and t >= impactAt then
			impacted = true
			if outcome == "Goal" then
				Effects.netRipple(pitch, target + into * 4.2, into)
				Effects.crowdJump(pitch, 2)
				if opts.celebrate then
					local origin = goalPoint(pitch, 0, 0.6, -1)
					Effects.celebrate(result.celebration, origin)
					if result.celebration2 then
						Effects.celebrate(result.celebration2, origin)
					end
				end
			end
			if opts.onImpact then
				opts.onImpact(result)
			end
		end

		-- Camera: start behind the spot, then chase the ball toward goal.
		if opts.camera then
			local flight = math.clamp((t - RUNUP) / travel, 0, 1)
			local chasePos = ballPos - (target - start).Unit * 9 + up * 2.6
			local chase = CFrame.lookAt(chasePos, target:Lerp(goalPoint(pitch, 0, 0.45, 0), 0.4))
			local blend = easeOut(flight) * 0.65
			cam.CFrame = idleCam:Lerp(chase, blend)
			cam.FieldOfView = 70 - ((scale < 1) and 14 or 0)
		end

		if t >= finishAt then
			conn:Disconnect()
			if active[pitch] == token then
				ShotPresenter.reset(pitch)
				if opts.camera then
					cam.FieldOfView = 70
					cam.CFrame = idleCam
				end
				if opts.onDone then
					opts.onDone(result)
				end
			end
		end
	end)
end

return ShotPresenter
