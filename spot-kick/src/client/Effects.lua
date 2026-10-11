-- Client-only juice: celebrations, net ripple, crowd bounce, sounds.
-- Everything here is created or animated by this client only, so it never
-- replicates and can't lag the server. (Client-created parts in Workspace stay
-- local; they go in Workspace rather than the camera so physics simulates them.)

local Debris = game:GetService("Debris")
local RunService = game:GetService("RunService")
local SoundService = game:GetService("SoundService")
local Workspace = game:GetService("Workspace")

local Config = require(game:GetService("ReplicatedStorage").Shared.Config)

local Effects = {}

local function container()
	local folder = Workspace:FindFirstChild("LocalFx")
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "LocalFx"
		folder.Parent = Workspace
	end
	return folder
end

-- Sounds ------------------------------------------------------------------------

local soundCache = {}
function Effects.sound(name, volume)
	local id = Config.Sounds[name]
	if not id or id == 0 then
		return
	end
	local s = soundCache[name]
	if not s then
		s = Instance.new("Sound")
		s.SoundId = "rbxassetid://" .. id
		s.Parent = SoundService
		soundCache[name] = s
	end
	s.Volume = volume or 0.8
	s.TimePosition = 0
	s:Play()
end

function Effects.startCrowdLoop()
	local id = Config.Sounds.CrowdLoop
	if not id or id == 0 then
		return
	end
	local s = Instance.new("Sound")
	s.SoundId = "rbxassetid://" .. id
	s.Looped = true
	s.Volume = 0.25
	s.Parent = SoundService
	s:Play()
end

-- Net ripple --------------------------------------------------------------------

-- Push net panels near `impact` (world position) back into the net with a
-- decaying wobble. `into` is the unit vector pointing into the net.
function Effects.netRipple(pitch, impact, into)
	local panels = {}
	for _, panel in ipairs(pitch.Net:GetChildren()) do
		local home = panel:GetAttribute("HomeCFrame")
		if home then
			local d = (home.Position - impact).Magnitude
			local weight = math.clamp(1 - d / 9, 0, 1)
			if weight > 0 then
				table.insert(panels, { part = panel, home = home, weight = weight })
			end
		end
	end
	local start = os.clock()
	local conn
	conn = RunService.RenderStepped:Connect(function()
		local t = os.clock() - start
		local amp = 2.2 * math.exp(-t * 3.5)
		for _, p in ipairs(panels) do
			local offset = into * amp * p.weight * math.cos(t * 16)
			p.part.CFrame = p.home + offset
		end
		if t > 1.4 then
			for _, p in ipairs(panels) do
				p.part.CFrame = p.home
			end
			conn:Disconnect()
		end
	end)
end

-- Crowd -------------------------------------------------------------------------

function Effects.crowdJump(pitch, duration)
	local fans = {}
	for _, p in ipairs(pitch.Theme:GetChildren()) do
		if p:GetAttribute("Crowd") then
			table.insert(fans, { part = p, home = p.CFrame, phase = math.random() * math.pi * 2 })
		end
	end
	if #fans == 0 then
		return
	end
	local start = os.clock()
	local conn
	conn = RunService.RenderStepped:Connect(function()
		local t = os.clock() - start
		for _, f in ipairs(fans) do
			f.part.CFrame = f.home + Vector3.new(0, math.abs(math.sin(t * 9 + f.phase)) * 0.8, 0)
		end
		if t > duration then
			for _, f in ipairs(fans) do
				f.part.CFrame = f.home
			end
			conn:Disconnect()
		end
	end)
end

-- Celebrations --------------------------------------------------------------

local function confetti(origin)
	local folder = container()
	for _ = 1, 70 do
		local p = Instance.new("Part")
		p.Size = Vector3.new(0.35, 0.05, 0.25)
		p.Color = Color3.fromHSV(math.random(), 0.75, 1)
		p.Material = Enum.Material.SmoothPlastic
		p.CanCollide = false
		p.CanQuery = false
		p.CanTouch = false
		p.CFrame = CFrame.new(origin + Vector3.new(math.random(-6, 6), math.random(0, 3), math.random(-2, 2)))
			* CFrame.Angles(math.random() * 6, math.random() * 6, math.random() * 6)
		p.AssemblyLinearVelocity = Vector3.new(math.random(-14, 14), math.random(18, 34), math.random(-4, 12))
		p.AssemblyAngularVelocity = Vector3.new(math.random(-20, 20), math.random(-20, 20), math.random(-20, 20))
		p.Parent = folder
		Debris:AddItem(p, 4)
	end
end

local function burst(position, color)
	local a = Instance.new("Part")
	a.Anchored = true
	a.CanCollide = false
	a.Transparency = 1
	a.Size = Vector3.new(0.2, 0.2, 0.2)
	a.Position = position
	a.Parent = container()
	local e = Instance.new("ParticleEmitter")
	e.Texture = "rbxasset://textures/particles/sparkles_main.dds"
	e.Color = ColorSequence.new(color)
	e.LightEmission = 1
	e.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.9), NumberSequenceKeypoint.new(1, 0) })
	e.Speed = NumberRange.new(14, 22)
	e.SpreadAngle = Vector2.new(180, 180)
	e.Lifetime = NumberRange.new(0.8, 1.3)
	e.Drag = 2
	e.Acceleration = Vector3.new(0, -12, 0)
	e.Rate = 0
	e.Parent = a
	e:Emit(90)
	Debris:AddItem(a, 2)
end

local function fireworks(origin)
	for i = 1, 4 do
		task.delay((i - 1) * 0.25, function()
			burst(origin + Vector3.new(math.random(-10, 10), math.random(10, 16), math.random(-4, 0)), Color3.fromHSV(math.random(), 0.8, 1))
		end)
	end
end

local function coinRain(origin)
	local folder = container()
	for _ = 1, 40 do
		local c = Instance.new("Part")
		c.Shape = Enum.PartType.Cylinder
		c.Size = Vector3.new(0.15, 0.9, 0.9)
		c.Color = Color3.fromRGB(255, 205, 60)
		c.Material = Enum.Material.Metal
		c.CanCollide = false
		c.CanQuery = false
		c.CanTouch = false
		c.CFrame = CFrame.new(origin + Vector3.new(math.random(-12, 12), math.random(12, 20), math.random(-3, 6)))
		c.AssemblyAngularVelocity = Vector3.new(0, 0, math.random(10, 25))
		c.Parent = folder
		Debris:AddItem(c, 3)
	end
end

local function lightning(origin)
	local folder = container()
	local top = origin + Vector3.new(math.random(-6, 6), 40, -4)
	local prev = top
	for i = 1, 8 do
		local nextPoint = top:Lerp(origin, i / 8) + Vector3.new(math.random(-3, 3), 0, math.random(-1, 1))
		local seg = Instance.new("Part")
		seg.Anchored = true
		seg.CanCollide = false
		seg.Material = Enum.Material.Neon
		seg.Color = Color3.fromRGB(180, 220, 255)
		local len = (nextPoint - prev).Magnitude
		seg.Size = Vector3.new(0.4, 0.4, len)
		seg.CFrame = CFrame.lookAt((prev + nextPoint) / 2, nextPoint)
		seg.Parent = folder
		Debris:AddItem(seg, 0.35)
		prev = nextPoint
	end
	burst(origin, Color3.fromRGB(180, 220, 255))
end

local celebrations = {
	Confetti = confetti,
	Fireworks = fireworks,
	CoinRain = coinRain,
	Lightning = lightning,
}

function Effects.celebrate(id, origin)
	local fn = celebrations[id] or confetti
	fn(origin)
end

-- Screen flash for impacts (white for goals, red-ish for saves).
function Effects.flash(gui, color)
	local f = Instance.new("Frame")
	f.Size = UDim2.fromScale(1, 1)
	f.BackgroundColor3 = color
	f.BackgroundTransparency = 0.55
	f.BorderSizePixel = 0
	f.ZIndex = 50
	f.Parent = gui
	game:GetService("TweenService"):Create(f, TweenInfo.new(0.35), { BackgroundTransparency = 1 }):Play()
	Debris:AddItem(f, 0.4)
end

return Effects
