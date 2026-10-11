-- Daily longest-streak leaderboard. One OrderedDataStore per UTC day, so the
-- board resets every day automatically and old days stay queryable.
--
-- Writes are batched (once per FLUSH_INTERVAL per player) to stay well inside
-- DataStore budgets.

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local Progression = require(game:GetService("ReplicatedStorage").Shared.Progression)

local FLUSH_INTERVAL = 30
local REFRESH_INTERVAL = 60
local TOP_N = 10

local LeaderboardService = {}

local pending = {} -- [userId] = { day = key, streak = n }
local nameCache = {}

local function storeFor(day)
	local ok, store = pcall(function()
		return DataStoreService:GetOrderedDataStore("DailyStreak_" .. day)
	end)
	return ok and store or nil
end

function LeaderboardService.submit(player, streak)
	local day = Progression.dayKey(os.time())
	local entry = pending[player.UserId]
	if not entry or entry.day ~= day or streak > entry.streak then
		pending[player.UserId] = { day = day, streak = streak }
	end
end

local function flush()
	local batch = pending
	pending = {}
	for userId, entry in pairs(batch) do
		local store = storeFor(entry.day)
		if store then
			local ok, err = pcall(function()
				store:UpdateAsync(tostring(userId), function(old)
					if old and old >= entry.streak then
						return nil
					end
					return entry.streak
				end)
			end)
			if not ok then
				warn("[Leaderboard] write failed:", err)
				pending[userId] = pending[userId] or entry
			end
		end
	end
end

local function nameFor(userId)
	if nameCache[userId] then
		return nameCache[userId]
	end
	local ok, name = pcall(Players.GetNameFromUserIdAsync, Players, userId)
	nameCache[userId] = ok and name or ("Player " .. userId)
	return nameCache[userId]
end

local function buildBoard(part)
	local gui = Instance.new("SurfaceGui")
	gui.Name = "Board"
	gui.Face = Enum.NormalId.Front
	gui.CanvasSize = Vector2.new(800, 600)
	gui.Parent = part

	local title = Instance.new("TextLabel")
	title.Size = UDim2.new(1, 0, 0, 90)
	title.BackgroundTransparency = 1
	title.Font = Enum.Font.GothamBlack
	title.TextColor3 = Color3.fromRGB(255, 215, 80)
	title.TextScaled = true
	title.Text = "TODAY'S LONGEST STREAKS"
	title.Parent = gui

	local list = Instance.new("Frame")
	list.Name = "List"
	list.Position = UDim2.new(0, 30, 0, 100)
	list.Size = UDim2.new(1, -60, 1, -110)
	list.BackgroundTransparency = 1
	list.Parent = gui
	local layout = Instance.new("UIListLayout")
	layout.SortOrder = Enum.SortOrder.LayoutOrder
	layout.Parent = list
	return list
end

local function render(list, entries)
	list:ClearAllChildren()
	local layout = Instance.new("UIListLayout")
	layout.SortOrder = Enum.SortOrder.LayoutOrder
	layout.Parent = list
	if #entries == 0 then
		entries = { { name = "No streaks yet. Be the first!", value = "" } }
	end
	for i, e in ipairs(entries) do
		local row = Instance.new("TextLabel")
		row.LayoutOrder = i
		row.Size = UDim2.new(1, 0, 0, 46)
		row.BackgroundTransparency = 1
		row.Font = Enum.Font.GothamBold
		row.TextScaled = true
		row.TextXAlignment = Enum.TextXAlignment.Left
		row.TextColor3 = (i <= 3 and e.value ~= "") and Color3.fromRGB(255, 230, 150) or Color3.new(1, 1, 1)
		row.Text = (e.value ~= "") and string.format("%d.  %s  —  %s", i, e.name, tostring(e.value)) or e.name
		row.Parent = list
	end
end

local function refresh(list)
	local store = storeFor(Progression.dayKey(os.time()))
	if not store then
		return
	end
	local ok, pages = pcall(function()
		return store:GetSortedAsync(false, TOP_N)
	end)
	if not ok then
		return
	end
	local entries = {}
	for _, item in ipairs(pages:GetCurrentPage()) do
		table.insert(entries, { name = nameFor(tonumber(item.key)), value = item.value })
	end
	render(list, entries)
end

function LeaderboardService.start(boardPart)
	local list = buildBoard(boardPart)
	render(list, {})
	task.spawn(function()
		while true do
			task.wait(FLUSH_INTERVAL)
			flush()
		end
	end)
	task.spawn(function()
		while true do
			refresh(list)
			task.wait(REFRESH_INTERVAL)
		end
	end)
	game:BindToClose(flush)
end

return LeaderboardService
