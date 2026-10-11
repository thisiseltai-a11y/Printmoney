-- Builds the lobby and one pitch per concurrent player from code, so the
-- place file needs no hand-built geometry. Swap any of this for modelled
-- assets later: clients only rely on the named parts listed below.
--
-- Each Workspace.Arena.Pitch_N contains:
--   GoalAnchor  invisible part at the bottom-centre of the goal mouth. Its
--               RightVector is the shooter's right and LookVector points into
--               the net, so aim (x, y) maps to GoalAnchor.CFrame * (x*HalfWidth, y*Height, 0)
--   Spot        the penalty spot; the ball rests above it
--   Ball        the ball (anchored; clients animate it locally)
--   Keeper      Model with PrimaryPart "Root"
--   Kicker      Model with PrimaryPart "Root"
--   Net         Folder of net panels with attributes Col/Row
--   Theme       Folder of decoration swapped per stage
--   PlayerStand where the owner's character is placed

local Workspace = game:GetService("Workspace")

local Config = require(game:GetService("ReplicatedStorage").Shared.Config)

local ArenaBuilder = {}

local NET_COLS, NET_ROWS = 12, 4
local NET_DEPTH = 5

local function part(props)
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide = props.CanCollide or false
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Material = props.Material or Enum.Material.SmoothPlastic
	for k, v in pairs(props) do
		if k ~= "CanCollide" and k ~= "Material" then
			p[k] = v
		end
	end
	return p
end

local function rgb(t)
	return Color3.fromRGB(t[1], t[2], t[3])
end

-- A blocky figure (keeper or kicker). Origin is the feet; Root sits at hip height.
local function buildFigure(name, cframe, bodyColor, accentColor, withGloves)
	local model = Instance.new("Model")
	model.Name = name

	local root = part({ Name = "Root", Size = Vector3.new(2, 2, 1), Transparency = 1, CFrame = cframe * CFrame.new(0, 3, 0) })
	root.Parent = model
	model.PrimaryPart = root

	local function add(partName, size, offset, color, shape)
		local p = part({ Name = partName, Size = size, Color = color, CFrame = root.CFrame * offset })
		if shape then
			p.Shape = shape
		end
		p.Parent = model
		return p
	end

	local skin = Color3.fromRGB(234, 184, 146)
	add("Torso", Vector3.new(2, 2.2, 1), CFrame.new(0, 1.1, 0), bodyColor)
	add("Number", Vector3.new(0.8, 1, 0.05), CFrame.new(0, 1.2, -0.53), accentColor)
	add("Head", Vector3.new(1.2, 1.2, 1.2), CFrame.new(0, 2.85, 0), skin)
	add("LeftArm", Vector3.new(0.8, 2, 0.8), CFrame.new(-1.4, 1.1, 0), bodyColor)
	add("RightArm", Vector3.new(0.8, 2, 0.8), CFrame.new(1.4, 1.1, 0), bodyColor)
	add("LeftLeg", Vector3.new(0.9, 2, 0.9), CFrame.new(-0.5, -1, 0), accentColor)
	add("RightLeg", Vector3.new(0.9, 2, 0.9), CFrame.new(0.5, -1, 0), accentColor)
	if withGloves then
		add("LeftGlove", Vector3.new(0.9, 0.7, 0.9), CFrame.new(-1.4, -0.2, 0), Color3.fromRGB(250, 250, 250))
		add("RightGlove", Vector3.new(0.9, 0.7, 0.9), CFrame.new(1.4, -0.2, 0), Color3.fromRGB(250, 250, 250))
	end
	return model
end

local function buildGoal(parent, anchorCFrame)
	local halfW, h = Config.Goal.HalfWidth, Config.Goal.Height
	local white = Color3.fromRGB(245, 245, 245)
	local postW = 0.5
	local goal = Instance.new("Folder")
	goal.Name = "Goal"
	goal.Parent = parent

	part({ Name = "LeftPost", Size = Vector3.new(postW, h + postW, postW), Color = white, CanCollide = true,
		CFrame = anchorCFrame * CFrame.new(-halfW - postW / 2, (h + postW) / 2, 0) }).Parent = goal
	part({ Name = "RightPost", Size = Vector3.new(postW, h + postW, postW), Color = white, CanCollide = true,
		CFrame = anchorCFrame * CFrame.new(halfW + postW / 2, (h + postW) / 2, 0) }).Parent = goal
	part({ Name = "Crossbar", Size = Vector3.new(halfW * 2 + postW * 2, postW, postW), Color = white, CanCollide = true,
		CFrame = anchorCFrame * CFrame.new(0, h + postW / 2, 0) }).Parent = goal

	-- Net: a grid of thin panels on the back plane so clients can ripple them.
	local net = Instance.new("Folder")
	net.Name = "Net"
	net.Parent = parent
	local cellW, cellH = (halfW * 2) / NET_COLS, h / NET_ROWS
	for col = 1, NET_COLS do
		for row = 1, NET_ROWS do
			local x = -halfW + cellW * (col - 0.5)
			local y = cellH * (row - 0.5)
			local panel = part({
				Name = "Panel",
				Size = Vector3.new(cellW - 0.08, cellH - 0.08, 0.1),
				Color = white,
				Transparency = 0.55,
				Material = Enum.Material.ForceField,
				CFrame = anchorCFrame * CFrame.new(x, y, -NET_DEPTH),
			})
			panel:SetAttribute("Col", col)
			panel:SetAttribute("Row", row)
			panel:SetAttribute("HomeCFrame", panel.CFrame)
			panel.Parent = net
		end
	end
	-- Static side and roof netting.
	for _, side in ipairs({ -1, 1 }) do
		part({ Name = "SideNet", Size = Vector3.new(0.1, h, NET_DEPTH), Color = white, Transparency = 0.7,
			Material = Enum.Material.ForceField, CFrame = anchorCFrame * CFrame.new(side * halfW, h / 2, -NET_DEPTH / 2) }).Parent = goal
	end
	part({ Name = "RoofNet", Size = Vector3.new(halfW * 2, 0.1, NET_DEPTH), Color = white, Transparency = 0.7,
		Material = Enum.Material.ForceField, CFrame = anchorCFrame * CFrame.new(0, h, -NET_DEPTH / 2) }).Parent = goal
end

local function buildPitch(index, origin)
	local pitch = Instance.new("Model")
	pitch.Name = "Pitch_" .. index
	pitch:SetAttribute("Index", index)

	local dist = Config.Shot.Distance
	local floor = part({
		Name = "Floor",
		Size = Vector3.new(Config.Arena.PitchSpacing - 4, 1, dist + 30),
		CFrame = CFrame.new(origin + Vector3.new(0, -0.5, -dist / 2)),
		Color = Color3.fromRGB(76, 150, 70),
		Material = Enum.Material.Grass,
		CanCollide = true,
	})
	floor.Parent = pitch

	-- The shooter faces -Z, so the goal frame's LookVector (into the net) is -Z.
	local goalCFrame = CFrame.lookAt(origin + Vector3.new(0, 0, -dist), origin + Vector3.new(0, 0, -dist - 1))
	local anchor = part({ Name = "GoalAnchor", Size = Vector3.new(1, 1, 1), Transparency = 1, CFrame = goalCFrame })
	anchor.Parent = pitch
	buildGoal(pitch, goalCFrame)

	part({ Name = "Spot", Shape = Enum.PartType.Cylinder, Size = Vector3.new(0.05, 1.2, 1.2), Color = Color3.fromRGB(250, 250, 250),
		CFrame = CFrame.new(origin + Vector3.new(0, 0.03, 0)) * CFrame.Angles(0, 0, math.pi / 2) }).Parent = pitch
	part({ Name = "BoxLine", Size = Vector3.new(Config.Goal.HalfWidth * 2 + 16, 0.05, 0.4), Color = Color3.fromRGB(250, 250, 250),
		CFrame = CFrame.new(origin + Vector3.new(0, 0.03, -dist + 18)) }).Parent = pitch

	local ball = part({ Name = "Ball", Shape = Enum.PartType.Ball, Size = Vector3.new(1.4, 1.4, 1.4),
		Color = Color3.fromRGB(245, 245, 245), CFrame = CFrame.new(origin + Vector3.new(0, 0.7, 0)) })
	local a0 = Instance.new("Attachment")
	a0.Name = "TrailA"
	a0.Position = Vector3.new(0, 0.5, 0)
	a0.Parent = ball
	local a1 = Instance.new("Attachment")
	a1.Name = "TrailB"
	a1.Position = Vector3.new(0, -0.5, 0)
	a1.Parent = ball
	ball.Parent = pitch

	local keeperCFrame = CFrame.lookAt(origin + Vector3.new(0, 0, -dist + 0.8), origin + Vector3.new(0, 0, 10))
	local keeperKit = Config.Stages[1].KitColor
	local keeper = buildFigure("Keeper", keeperCFrame, rgb(keeperKit), Color3.fromRGB(30, 30, 30), true)
	keeper:SetAttribute("HomeCFrame", keeper:GetPivot())
	keeper.Parent = pitch

	local kickerCFrame = CFrame.lookAt(origin + Vector3.new(-1.5, 0, 4), origin + Vector3.new(0, 0, -dist))
	local kicker = buildFigure("Kicker", kickerCFrame, Color3.fromRGB(230, 230, 235), Color3.fromRGB(30, 60, 140), false)
	kicker:SetAttribute("HomeCFrame", kicker:GetPivot())
	kicker.Parent = pitch

	local stand = part({ Name = "PlayerStand", Size = Vector3.new(4, 0.2, 4), Transparency = 1,
		CFrame = CFrame.new(origin + Vector3.new(10, 0.1, 8)) })
	stand.Parent = pitch

	local theme = Instance.new("Folder")
	theme.Name = "Theme"
	theme.Parent = pitch

	-- Sign that shows who is shooting here.
	local sign = part({ Name = "Sign", Size = Vector3.new(14, 3, 0.4), Color = Color3.fromRGB(25, 25, 35),
		CFrame = CFrame.new(origin + Vector3.new(0, 14, -dist - NET_DEPTH - 2)) })
	local gui = Instance.new("SurfaceGui")
	gui.Face = Enum.NormalId.Front
	gui.Parent = sign
	local label = Instance.new("TextLabel")
	label.Name = "Owner"
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.TextScaled = true
	label.Font = Enum.Font.GothamBlack
	label.TextColor3 = Color3.new(1, 1, 1)
	label.Text = "OPEN PITCH"
	label.Parent = gui
	sign.CFrame = CFrame.lookAt(sign.Position, origin)
	sign.Parent = pitch

	pitch.PrimaryPart = floor
	return pitch
end

-- Decoration per stage: Park (grass + trees), Street (asphalt + walls),
-- Stadium/Final (stands with crowd, floodlights).
function ArenaBuilder.applyTheme(pitch, stageIndex)
	local theme = pitch.Theme
	theme:ClearAllChildren()
	local floor = pitch.Floor
	local origin = pitch.Spot.Position * Vector3.new(1, 0, 1)
	local dist = Config.Shot.Distance
	local stageId = Config.Stages[stageIndex].Id

	local keeperColor = rgb(Config.Stages[stageIndex].KitColor)
	for _, p in ipairs(pitch.Keeper:GetChildren()) do
		if p.Name == "Torso" or p.Name == "LeftArm" or p.Name == "RightArm" then
			p.Color = keeperColor
		end
	end

	if stageId == "Park" then
		floor.Material = Enum.Material.Grass
		floor.Color = Color3.fromRGB(86, 160, 72)
		for i = 1, 6 do
			local side = (i % 2 == 0) and 1 or -1
			local pos = origin + Vector3.new(side * (24 + (i % 3) * 3), 0, -dist - 6 + i * 6)
			part({ Name = "Trunk", Size = Vector3.new(1.2, 6, 1.2), Color = Color3.fromRGB(110, 75, 45), CFrame = CFrame.new(pos + Vector3.new(0, 3, 0)) }).Parent = theme
			part({ Name = "Leaves", Shape = Enum.PartType.Ball, Size = Vector3.new(7, 7, 7), Color = Color3.fromRGB(60, 130, 60),
				Material = Enum.Material.Grass, CFrame = CFrame.new(pos + Vector3.new(0, 8, 0)) }).Parent = theme
		end
	elseif stageId == "Street" then
		floor.Material = Enum.Material.Asphalt
		floor.Color = Color3.fromRGB(70, 70, 76)
		for _, side in ipairs({ -1, 1 }) do
			part({ Name = "Wall", Size = Vector3.new(1, 10, dist + 24), Color = Color3.fromRGB(150, 85, 70), Material = Enum.Material.Brick,
				CFrame = CFrame.new(origin + Vector3.new(side * 30, 5, -dist / 2)) }).Parent = theme
		end
		part({ Name = "BackWall", Size = Vector3.new(60, 12, 1), Color = Color3.fromRGB(150, 85, 70), Material = Enum.Material.Brick,
			CFrame = CFrame.new(origin + Vector3.new(0, 6, -dist - 10)) }).Parent = theme
	else
		floor.Material = Enum.Material.Grass
		floor.Color = (stageId == "Final") and Color3.fromRGB(60, 140, 60) or Color3.fromRGB(70, 150, 66)
		local rows = (stageId == "Final") and 6 or 4
		local rng = Random.new(pitch:GetAttribute("Index"))
		for r = 1, rows do
			local z = -dist - 8 - r * 2.5
			local y = r * 1.8
			part({ Name = "Step", Size = Vector3.new(60, 1, 2.5), Color = Color3.fromRGB(60, 60, 70), CFrame = CFrame.new(origin + Vector3.new(0, y, z)) }).Parent = theme
			for c = 1, 20 do
				local fan = part({ Name = "Fan", Size = Vector3.new(1.4, 2, 1),
					Color = Color3.fromHSV(rng:NextNumber(), 0.6, 0.9),
					CFrame = CFrame.new(origin + Vector3.new(-28.5 + c * 2.85 + rng:NextNumber(-0.4, 0.4), y + 1.5, z)) })
				fan:SetAttribute("Crowd", true)
				fan.Parent = theme
			end
		end
		for _, side in ipairs({ -1, 1 }) do
			local mast = part({ Name = "Floodlight", Size = Vector3.new(1, 30, 1), Color = Color3.fromRGB(180, 180, 190),
				CFrame = CFrame.new(origin + Vector3.new(side * 28, 15, -dist - 4)) })
			mast.Parent = theme
			local lamp = part({ Name = "Lamp", Size = Vector3.new(5, 2, 1), Color = Color3.fromRGB(255, 250, 220), Material = Enum.Material.Neon,
				CFrame = CFrame.new(origin + Vector3.new(side * 28, 30, -dist - 4)) })
			local light = Instance.new("SpotLight")
			light.Brightness = 3
			light.Range = 60
			light.Angle = 70
			light.Face = Enum.NormalId.Bottom
			light.Parent = lamp
			lamp.Parent = theme
		end
	end
	pitch:SetAttribute("Stage", stageIndex)
end

local function buildLobby(origin)
	local lobby = Instance.new("Model")
	lobby.Name = "Lobby"
	part({ Name = "Floor", Size = Vector3.new(Config.Arena.PitchCount * Config.Arena.PitchSpacing, 1, 40),
		CFrame = CFrame.new(origin + Vector3.new((Config.Arena.PitchCount - 1) * Config.Arena.PitchSpacing / 2, -0.5, 34)),
		Color = Color3.fromRGB(200, 200, 205), Material = Enum.Material.Concrete, CanCollide = true }).Parent = lobby

	local spawn = Instance.new("SpawnLocation")
	spawn.Anchored = true
	spawn.Size = Vector3.new(8, 1, 8)
	spawn.CFrame = CFrame.new(origin + Vector3.new(0, 0, 34))
	spawn.Transparency = 0.5
	spawn.Neutral = true
	spawn.Duration = 0
	spawn.Parent = lobby

	local board = part({ Name = "Leaderboard", Size = Vector3.new(16, 12, 0.6), Color = Color3.fromRGB(20, 22, 30),
		CFrame = CFrame.lookAt(origin + Vector3.new(-14, 7, 44), origin + Vector3.new(-14, 7, 0)) })
	board.Parent = lobby
	return lobby
end

function ArenaBuilder.build()
	local arena = Instance.new("Folder")
	arena.Name = "Arena"
	local origin = Vector3.new(Config.Arena.Origin[1], Config.Arena.Origin[2], Config.Arena.Origin[3])
	buildLobby(origin).Parent = arena
	local pitches = {}
	for i = 1, Config.Arena.PitchCount do
		local pitch = buildPitch(i, origin + Vector3.new((i - 1) * Config.Arena.PitchSpacing, 0, 0))
		ArenaBuilder.applyTheme(pitch, 1)
		pitch.Parent = arena
		pitches[i] = pitch
	end
	arena.Parent = Workspace
	return arena, pitches
end

return ArenaBuilder
