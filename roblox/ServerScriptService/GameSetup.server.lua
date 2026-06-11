-- GameSetup.server.lua
-- Creates all RemoteEvents needed by the Resurreccion system on server start

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local eventNames = {
	"ActivateResurreccion",
	"DeactivateResurreccion",
	"ActivateSegundaEtapa",
	"UseAbility",
	"AmorControl",
	"SpawnWolves",
}

local eventsFolder = ReplicatedStorage:FindFirstChild("Events")
if not eventsFolder then
	eventsFolder = Instance.new("Folder")
	eventsFolder.Name = "Events"
	eventsFolder.Parent = ReplicatedStorage
end

for _, name in ipairs(eventNames) do
	if not eventsFolder:FindFirstChild(name) then
		local event = Instance.new("RemoteEvent")
		event.Name = name
		event.Parent = eventsFolder
	end
end

print("[GameSetup] All RemoteEvents created.")
