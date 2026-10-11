-- 1v1 shootout: two players alternate penalties against the same AI keeper
-- (Config.Duel.StageIndex). Best of ShotsEach, then sudden death. The match
-- ends early once one side can't catch up. Solo streaks are not affected.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage.Shared
local Config = require(Shared.Config)
local KeeperAI = require(Shared.KeeperAI)
local Net = require(Shared.Net)

local DataService = require(script.Parent.DataService)
local GameService = require(script.Parent.GameService)
local ShopService = require(script.Parent.ShopService)

local MAX_SUDDEN_DEATH = 10

local DuelService = {}

local queue = nil -- waiting Player
local matches = {} -- [Player] = match

local rng = Random.new()
local function roll()
	return rng:NextNumber()
end

local function opponentOf(match, player)
	return (match.players[1] == player) and match.players[2] or match.players[1]
end

local function sendState(match)
	for i, player in ipairs(match.players) do
		local other = match.players[3 - i]
		Net.Duel:FireClient(player, {
			active = not match.finished,
			finished = match.finished,
			opponent = other.DisplayName,
			myShots = match.shots[i],
			theirShots = match.shots[3 - i],
			shotsEach = Config.Duel.ShotsEach,
			yourTurn = not match.finished and match.turn == i,
			result = match.finished and (match.winner == player and "Win" or (match.winner == nil and "Draw" or "Loss")) or nil,
		})
	end
end

local function goals(list)
	local n = 0
	for _, scored in ipairs(list) do
		if scored then
			n = n + 1
		end
	end
	return n
end

-- Returns winnerIndex (1/2), 0 for draw, or nil if the match goes on.
local function decide(match)
	local a, b = match.shots[1], match.shots[2]
	local each = Config.Duel.ShotsEach
	local ga, gb = goals(a), goals(b)
	if #a <= each and #b <= each then
		local leftA, leftB = each - #a, each - #b
		if ga > gb + leftB then
			return 1
		end
		if gb > ga + leftA then
			return 2
		end
		if #a == each and #b == each and ga ~= gb then
			return ga > gb and 1 or 2
		end
		return nil
	end
	-- Sudden death: decide after each pair of shots.
	if #a == #b then
		if ga ~= gb then
			return ga > gb and 1 or 2
		end
		if #a >= each + MAX_SUDDEN_DEATH then
			return 0
		end
	end
	return nil
end

local function finish(match, winnerIndex)
	if match.finished then
		return
	end
	match.finished = true
	match.winner = (winnerIndex == 1 or winnerIndex == 2) and match.players[winnerIndex] or nil
	for _, player in ipairs(match.players) do
		local profile = DataService.get(player)
		if profile and player.Parent then
			local reward = (match.winner == player) and Config.Duel.WinReward or Config.Duel.ParticipationReward
			profile.coins = profile.coins + reward
			GameService.pushState(player, (match.winner == player and "You won the shootout! +" or "Shootout over. +") .. reward .. " coins")
		end
		matches[player] = nil
	end
	sendState(match)
end

local function startTurnTimer(match)
	match.turnToken = (match.turnToken or 0) + 1
	local token, turn = match.turnToken, match.turn
	task.delay(Config.Duel.TurnTimeout, function()
		if not match.finished and match.turnToken == token then
			-- Took too long: counts as a miss.
			table.insert(match.shots[turn], false)
			match.turn = 3 - turn
			local w = decide(match)
			if w then
				finish(match, w)
			else
				startTurnTimer(match)
				sendState(match)
			end
		end
	end)
end

local function startMatch(a, b)
	local match = {
		players = { a, b },
		shots = { {}, {} },
		memory = { KeeperAI.newMemory(roll), KeeperAI.newMemory(roll) },
		turn = 1,
		finished = false,
	}
	matches[a] = match
	matches[b] = match
	for _, player in ipairs(match.players) do
		local session = GameService.session(player)
		if session and session.pitch then
			GameService.setStage(player, Config.Duel.StageIndex)
		end
	end
	startTurnTimer(match)
	sendState(match)
end

-- Called by GameService for every shot. Returns true when we handled it.
local function intercept(player, input)
	local match = matches[player]
	if not match then
		return false
	end
	local index = (match.players[1] == player) and 1 or 2
	if match.finished or match.turn ~= index then
		return true -- not your turn: swallow the shot
	end
	local result = GameService.resolveShot(player, input, Config.Duel.StageIndex, match.memory[index])
	result.duel = true
	result.coins = 0
	table.insert(match.shots[index], result.outcome == "Goal")
	match.turn = 3 - index
	Net.ShotPlayed:FireAllClients(result)

	task.delay(result.travelTime + 0.8, function()
		local w = decide(match)
		if w then
			finish(match, w)
		else
			startTurnTimer(match)
			sendState(match)
		end
	end)
	return true
end

local function restoreStage(player)
	local profile = DataService.get(player)
	if profile then
		GameService.setStage(player, profile.currentStage)
	end
end

function DuelService.start()
	GameService.shotInterceptor = intercept

	ShopService.register("DuelQueue", function(player)
		if matches[player] then
			return false, "Already in a match"
		end
		if queue == player then
			return true, "Searching for an opponent..."
		end
		if queue and queue.Parent then
			local other = queue
			queue = nil
			startMatch(other, player)
			return true, "Match found!"
		end
		queue = player
		return true, "Searching for an opponent..."
	end)

	ShopService.register("DuelLeave", function(player)
		if queue == player then
			queue = nil
			return true, "Left the queue"
		end
		local match = matches[player]
		if match then
			local opponent = opponentOf(match, player)
			finish(match, (match.players[1] == opponent) and 1 or 2)
			restoreStage(player)
			restoreStage(opponent)
			return true
		end
		return false, "Not in a match"
	end)

	Players.PlayerRemoving:Connect(function(player)
		if queue == player then
			queue = nil
		end
		local match = matches[player]
		if match then
			local opponent = opponentOf(match, player)
			finish(match, (match.players[1] == opponent) and 1 or 2)
			restoreStage(opponent)
		end
	end)

	Net.Duel.OnServerEvent:Connect(function(player, action)
		-- The client acknowledges the result screen; restore their solo stage.
		if action == "Done" and not matches[player] then
			restoreStage(player)
		end
	end)
end

return DuelService
