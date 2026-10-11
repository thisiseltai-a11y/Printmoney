-- Player save data. Loads on join, autosaves, saves on leave and shutdown.
--
-- Uses UpdateAsync with a light session lock so a fast server-hop can't load
-- stale data while the previous server is still saving. In Studio without
-- "Enable Studio Access to API Services", it falls back to in-memory data.

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local Progression = require(game:GetService("ReplicatedStorage").Shared.Progression)

local STORE_NAME = "PlayerData_v1"
local AUTOSAVE_INTERVAL = 120
local LOCK_TIMEOUT = 90 -- seconds before another server's lock is considered stale
local MAX_RETRIES = 5

local DataService = {}
DataService.Profiles = {} -- [Player] = profile table
DataService.Loaded = Instance.new("BindableEvent") -- fires (player, profile)

local store
local offline = false
do
	local ok, result = pcall(function()
		return DataStoreService:GetDataStore(STORE_NAME)
	end)
	if ok then
		store = result
	else
		offline = true
		warn("[DataService] DataStore unavailable, using in-memory data:", result)
	end
end

local function keyFor(player)
	return "u_" .. player.UserId
end

local function retry(fn)
	local lastErr
	for attempt = 1, MAX_RETRIES do
		local ok, result = pcall(fn)
		if ok then
			return true, result
		end
		lastErr = result
		task.wait(math.min(2 ^ attempt, 16))
	end
	return false, lastErr
end

local function load(player)
	if offline then
		return Progression.newProfile()
	end
	local jobId = game.JobId
	for _ = 1, 4 do
		local lockedBy
		local ok, data = retry(function()
			return store:UpdateAsync(keyFor(player), function(old)
				old = old or {}
				local lock = old.sessionLock
				if lock and lock.jobId ~= jobId and os.time() - (lock.time or 0) < LOCK_TIMEOUT then
					lockedBy = lock.jobId
					return nil -- cancel the write; another server still owns it
				end
				lockedBy = nil
				old.sessionLock = { jobId = jobId, time = os.time() }
				return old
			end)
		end)
		if not ok then
			return nil, data
		end
		if not lockedBy then
			data.sessionLock = nil
			return Progression.reconcile(data)
		end
		task.wait(6)
	end
	-- The other server never released; take over rather than block the player.
	warn("[DataService] Stealing stale session lock for", player.Name)
	local ok, data = retry(function()
		return store:UpdateAsync(keyFor(player), function(old)
			old = old or {}
			old.sessionLock = { jobId = game.JobId, time = os.time() }
			return old
		end)
	end)
	if not ok then
		return nil, data
	end
	data.sessionLock = nil
	return Progression.reconcile(data)
end

function DataService.save(player, release)
	local profile = DataService.Profiles[player]
	if not profile or offline then
		return true
	end
	local ok, err = retry(function()
		return store:UpdateAsync(keyFor(player), function(old)
			local lock = old and old.sessionLock
			if lock and lock.jobId ~= game.JobId then
				return nil -- another server owns this player now; don't clobber it
			end
			local copy = table.clone(profile)
			copy.sessionLock = (not release) and { jobId = game.JobId, time = os.time() } or nil
			return copy
		end)
	end)
	if not ok then
		warn("[DataService] Save failed for", player.Name, err)
	end
	return ok
end

function DataService.get(player)
	return DataService.Profiles[player]
end

-- Wait for a profile (used by systems that start before load finishes).
function DataService.waitFor(player)
	while player.Parent and not DataService.Profiles[player] do
		task.wait(0.2)
	end
	return DataService.Profiles[player]
end

local function onPlayerAdded(player)
	local profile, err = load(player)
	if not player.Parent then
		return
	end
	if not profile then
		player:Kick("Couldn't load your save, please rejoin. (" .. tostring(err) .. ")")
		return
	end
	DataService.Profiles[player] = profile
	DataService.Loaded:Fire(player, profile)
end

local function onPlayerRemoving(player)
	if DataService.Profiles[player] then
		DataService.save(player, true)
		DataService.Profiles[player] = nil
	end
end

function DataService.start()
	Players.PlayerAdded:Connect(onPlayerAdded)
	Players.PlayerRemoving:Connect(onPlayerRemoving)
	for _, player in ipairs(Players:GetPlayers()) do
		task.spawn(onPlayerAdded, player)
	end

	task.spawn(function()
		while true do
			task.wait(AUTOSAVE_INTERVAL)
			for player in pairs(DataService.Profiles) do
				task.spawn(DataService.save, player, false)
			end
		end
	end)

	game:BindToClose(function()
		if RunService:IsStudio() and offline then
			return
		end
		local pending = 0
		for player in pairs(DataService.Profiles) do
			pending = pending + 1
			task.spawn(function()
				DataService.save(player, true)
				pending = pending - 1
			end)
		end
		local deadline = os.clock() + 25
		while pending > 0 and os.clock() < deadline do
			task.wait(0.1)
		end
	end)
end

return DataService
