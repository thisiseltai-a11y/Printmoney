-- Remote definitions. The server creates them; clients wait for them.
--
--   Shoot        (C->S)  { aimX, aimY, power, curve }
--   ShotPlayed   (S->all) shot result for one pitch (everyone animates it)
--   State        (S->C)  full profile snapshot + derived values for the UI
--   Notify       (S->C)  short toast message
--   Duel         (S->C)  1v1 match state
--   Request      (C->S RemoteFunction) action, ... -> { ok, error?, ... }

local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local EVENTS = { "Shoot", "ShotPlayed", "State", "Notify", "Duel" }
local FUNCTIONS = { "Request" }

local Net = {}

local folder
if RunService:IsServer() then
	folder = Instance.new("Folder")
	folder.Name = "Remotes"
	for _, name in ipairs(EVENTS) do
		local remote = Instance.new("RemoteEvent")
		remote.Name = name
		remote.Parent = folder
	end
	for _, name in ipairs(FUNCTIONS) do
		local remote = Instance.new("RemoteFunction")
		remote.Name = name
		remote.Parent = folder
	end
	folder.Parent = ReplicatedStorage
else
	folder = ReplicatedStorage:WaitForChild("Remotes")
end

for _, name in ipairs(EVENTS) do
	Net[name] = folder:WaitForChild(name)
end
for _, name in ipairs(FUNCTIONS) do
	Net[name] = folder:WaitForChild(name)
end

return Net
