-- Core loop on the server: assigns each player a pitch, resolves shots
-- authoritatively (client only sends aim/power/curve), runs the keeper AI,
-- pays out coins and tracks streaks. Clients only animate the result.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage.Shared
local Config = require(Shared.Config)
local ShotMath = require(Shared.ShotMath)
local KeeperAI = require(Shared.KeeperAI)
local Progression = require(Shared.Progression)
local Cosmetics = require(Shared.Cosmetics)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)
local MonetizationService = require(script.Parent.MonetizationService)
local LeaderboardService = require(script.Parent.LeaderboardService)
local ArenaBuilder = require(script.Parent.ArenaBuilder)

local GameService = {}

local pitches = {} -- [index] = Model
local pitchOwner = {} -- [index] = Player
local sessions = {} -- [Player] = { pitch, streak, memory, lastShot }

-- Optional hook (set by DuelService). Return true to take over the shot result.
GameService.shotInterceptor = nil

local BOOST_MULTIPLIER = 2
for _, product in ipairs(Config.DevProducts) do
	if product.BoostMultiplier then
		BOOST_MULTIPLIER = product.BoostMultiplier
	end
end

local rng = Random.new()
local function roll()
	return rng:NextNumber()
end

function GameService.session(player)
	return sessions[player]
end

function GameService.pitch(index)
	return pitches[index]
end

local function rgb(t)
	return Color3.fromRGB(t[1], t[2], t[3])
end

-- Cosmetics -------------------------------------------------------------------

function GameService.applyCosmetics(player)
	local session, profile = sessions[player], DataService.get(player)
	if not session or not session.pitch or not profile then
		return
	end
	local pitch = pitches[session.pitch]
	local passes = MonetizationService.passes(player)

	local ball = Cosmetics.get("Ball", profile.equipped.Ball) or Cosmetics.get("Ball", "Classic")
	pitch.Ball.Color = rgb(ball.Color)
	pitch.Ball.Material = Enum.Material[ball.Material] or Enum.Material.SmoothPlastic

	local kit = Cosmetics.get("Kit", profile.equipped.Kit) or Cosmetics.get("Kit", "Home")
	for _, p in ipairs(pitch.Kicker:GetChildren()) do
		if p.Name == "Torso" or p.Name == "LeftArm" or p.Name == "RightArm" then
			p.Color = rgb(kit.Color)
		elseif p.Name == "LeftLeg" or p.Name == "RightLeg" or p.Name == "Number" then
			p.Color = rgb(kit.Accent)
		end
	end

	local existing = pitch.Ball:FindFirstChild("Trail")
	if existing then
		existing:Destroy()
	end
	local trailId = profile.equipped.Trail
	local trail = trailId and Cosmetics.isOwned(profile, passes, "Trail", trailId) and Cosmetics.get("Trail", trailId)
	if trail and trail.Color then
		local t = Instance.new("Trail")
		t.Name = "Trail"
		t.Attachment0 = pitch.Ball.TrailA
		t.Attachment1 = pitch.Ball.TrailB
		t.Color = ColorSequence.new(rgb(trail.Color), rgb(trail.Color2 or trail.Color))
		t.Transparency = NumberSequence.new(0.1, 1)
		t.Lifetime = 0.35
		t.LightEmission = 0.6
		t.FaceCamera = true
		t.Parent = pitch.Ball
	end
end

-- Client state ------------------------------------------------------------------

function GameService.pushState(player, message)
	local profile, session = DataService.get(player), sessions[player]
	if not profile or not session then
		return
	end
	local passes = MonetizationService.passes(player)
	local canDaily, dailyReward, dailyDay, dailyWait = Progression.dailyStatus(profile, os.time())
	Net.State:FireClient(player, {
		profile = profile,
		passes = passes,
		streak = session.streak,
		pitch = session.pitch,
		multiplier = Progression.streakMultiplier(session.streak) * Progression.baseMultiplier(profile, {
			doubleCoins = passes.DoubleCoins,
		}),
		daily = { canClaim = canDaily, reward = dailyReward, day = dailyDay, wait = dailyWait },
		rebirthCost = Progression.rebirthCost(profile.rebirths),
	})
	if message then
		Net.Notify:FireClient(player, message)
	end

	local stats = player:FindFirstChild("leaderstats")
	if stats then
		stats.Coins.Value = profile.coins
		stats.Streak.Value = session.streak
		stats.Rebirths.Value = profile.rebirths
	end
end

-- Pitches -----------------------------------------------------------------------

local function claimPitch(player)
	for i = 1, #pitches do
		if not pitchOwner[i] then
			pitchOwner[i] = player
			return i
		end
	end
	return nil
end

local function placeCharacter(player)
	local session = sessions[player]
	local character = player.Character
	if not session or not session.pitch or not character then
		return
	end
	local stand = pitches[session.pitch].PlayerStand
	character:PivotTo(stand.CFrame * CFrame.new(0, 3, 0))
end

function GameService.setStage(player, stageIndex)
	local session = sessions[player]
	if session and session.pitch then
		ArenaBuilder.applyTheme(pitches[session.pitch], stageIndex)
	end
end

-- Shots -------------------------------------------------------------------------

local function validInput(input)
	if type(input) ~= "table" then
		return false
	end
	for _, key in ipairs({ "aimX", "aimY", "power", "curve" }) do
		local v = input[key]
		if type(v) ~= "number" or v ~= v or v == math.huge or v == -math.huge then
			return false
		end
	end
	return true
end

-- Resolve a shot for `player` against the keeper of `stageIndex`. Used by the
-- solo loop and by duels. Returns the result table (also broadcast).
function GameService.resolveShot(player, input, stageIndex, memory)
	local profile = DataService.get(player)
	local session = sessions[player]
	local shot = ShotMath.resolve(input, profile.upgrades, roll)
	local keeper = KeeperAI.decide(Config.Stages[stageIndex].Keeper, memory or session.memory, shot, roll)

	local outcome
	if shot.outcome == "Miss" then
		outcome = "Miss"
	elseif shot.outcome == "Post" then
		outcome = "Post"
	elseif keeper.saved then
		outcome = "Save"
	else
		outcome = "Goal"
	end

	profile.totalShots = profile.totalShots + 1
	if outcome == "Goal" then
		profile.totalGoals = profile.totalGoals + 1
	end

	return {
		pitch = session.pitch,
		userId = player.UserId,
		x = shot.x,
		y = shot.y,
		power = shot.power,
		bend = shot.bend,
		travelTime = shot.travelTime,
		keeperX = keeper.diveX,
		keeperY = keeper.diveY,
		keeperZone = keeper.zone,
		outcome = outcome,
		celebration = profile.equipped.Celebration,
		celebration2 = MonetizationService.hasPass(player, "ExtraSlot") and profile.equipped.Celebration2 or nil,
	}
end

local function onShoot(player, input)
	local profile, session = DataService.get(player), sessions[player]
	if not profile or not session or not session.pitch or not validInput(input) then
		return
	end
	local now = os.clock()
	if now - session.lastShot < Config.Shot.Cooldown then
		return
	end
	session.lastShot = now

	if GameService.shotInterceptor and GameService.shotInterceptor(player, input) then
		return
	end

	local stageIndex = profile.currentStage
	local result = GameService.resolveShot(player, input, stageIndex)

	local passes = MonetizationService.passes(player)
	local boost
	if profile.boostShots > 0 then
		profile.boostShots = profile.boostShots - 1
		boost = BOOST_MULTIPLIER
	end

	if result.outcome == "Goal" then
		local earned = Progression.coinsForGoal(profile, stageIndex, session.streak, {
			doubleCoins = passes.DoubleCoins,
			boostMultiplier = boost,
		})
		session.streak = session.streak + 1
		profile.coins = profile.coins + earned
		result.coins = earned
		if session.streak > profile.bestStreak then
			profile.bestStreak = session.streak
		end
		if Progression.recordDailyStreak(profile, session.streak, os.time()) then
			LeaderboardService.submit(player, session.streak)
		end
	else
		result.coins = 0
		result.lostStreak = session.streak
		session.streak = 0
	end
	result.streak = session.streak
	result.multiplier = Progression.streakMultiplier(session.streak)

	Net.ShotPlayed:FireAllClients(result)
	-- Delay the HUD update so coins tick up when the ball hits the net.
	task.delay(result.travelTime + 0.3, GameService.pushState, player)
end

-- Players -----------------------------------------------------------------------

local function makeLeaderstats(player)
	local stats = Instance.new("Folder")
	stats.Name = "leaderstats"
	for _, name in ipairs({ "Coins", "Streak", "Rebirths" }) do
		local v = Instance.new("IntValue")
		v.Name = name
		v.Parent = stats
	end
	stats.Parent = player
end

local function onLoaded(player, profile)
	local index = claimPitch(player)
	sessions[player] = {
		pitch = index,
		streak = 0,
		memory = KeeperAI.newMemory(roll),
		lastShot = 0,
	}
	makeLeaderstats(player)
	if index then
		local pitch = pitches[index]
		pitch.Sign.SurfaceGui.Owner.Text = string.upper(player.DisplayName)
		ArenaBuilder.applyTheme(pitch, profile.currentStage)
		GameService.applyCosmetics(player)
		placeCharacter(player)
	else
		Net.Notify:FireClient(player, "All pitches are busy. You'll get one as soon as someone leaves.")
	end
	GameService.pushState(player)
end

local function onRemoving(player)
	local session = sessions[player]
	if session and session.pitch then
		pitchOwner[session.pitch] = nil
		pitches[session.pitch].Sign.SurfaceGui.Owner.Text = "OPEN PITCH"
		-- Hand the pitch to someone who is waiting.
		for other, s in pairs(sessions) do
			if other ~= player and not s.pitch then
				s.pitch = claimPitch(other)
				pitches[s.pitch].Sign.SurfaceGui.Owner.Text = string.upper(other.DisplayName)
				ArenaBuilder.applyTheme(pitches[s.pitch], DataService.get(other).currentStage)
				GameService.applyCosmetics(other)
				placeCharacter(other)
				GameService.pushState(other, "A pitch opened up. Go!")
				break
			end
		end
	end
	sessions[player] = nil
end

function GameService.start(pitchList)
	pitches = pitchList
	DataService.Loaded.Event:Connect(onLoaded)
	Players.PlayerRemoving:Connect(onRemoving)
	Players.PlayerAdded:Connect(function(player)
		player.CharacterAdded:Connect(function()
			task.wait(0.1)
			placeCharacter(player)
		end)
	end)
	Net.Shoot.OnServerEvent:Connect(onShoot)
	MonetizationService.Changed.Event:Connect(function(player, message)
		GameService.applyCosmetics(player)
		GameService.pushState(player, message)
	end)
end

return GameService
