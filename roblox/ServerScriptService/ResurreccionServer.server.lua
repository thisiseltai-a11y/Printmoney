-- ResurreccionServer.server.lua
-- Handles Resurreccion activation, stat changes, and ability unlocks on the server

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local ResurreccionData = require(ReplicatedStorage.Modules.ResurreccionData)

-- RemoteEvents wired up in Studio under ReplicatedStorage/Events
local Events = ReplicatedStorage:WaitForChild("Events")
local ActivateResurreccion = Events:WaitForChild("ActivateResurreccion")
local DeactivateResurreccion = Events:WaitForChild("DeactivateResurreccion")
local UseAbility = Events:WaitForChild("UseAbility")
local ActivateSegundaEtapa = Events:WaitForChild("ActivateSegundaEtapa")

-- Tracks which players are currently in Resurreccion
local activeResurreccion = {}  -- [player] = { form data, tickActivated }

-- ──────────────────────────────────────────────
--  Helpers
-- ──────────────────────────────────────────────

local function getCharacterProfile(player)
	-- Expects a "Profile" folder on the player with an "Arrancar" StringValue
	-- and a "Reiatsu" / "EspadaName" value set up by the main DataStore script.
	local profile = player:FindFirstChild("Profile")
	if not profile then return nil end
	return {
		race      = profile:FindFirstChild("Race")      and profile.Race.Value      or "Arrancar",
		espadaName = profile:FindFirstChild("EspadaName") and profile.EspadaName.Value or nil,
		reiatsu   = profile:FindFirstChild("Reiatsu")   and profile.Reiatsu.Value   or 0,
	}
end

local function applyBodyScale(character, scale)
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end
	local desc = humanoid:GetAppliedDescription()
	desc.BodyHeightScale  = scale.Y
	desc.BodyWidthScale   = scale.X
	desc.BodyDepthScale   = scale.Z
	humanoid:ApplyDescription(desc)
end

local function applyStatMultipliers(character, formData)
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end
	-- Speed
	humanoid.WalkSpeed = 16 * formData.SpeedMultiplier
	-- Max health scales with Reiatsu multiplier (base 100)
	humanoid.MaxHealth = 100 * formData.ReiatsuMultiplier
	humanoid.Health    = humanoid.MaxHealth
end

local function resetStats(character)
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end
	humanoid.WalkSpeed = 16
	humanoid.MaxHealth = 100
	humanoid.Health    = math.min(humanoid.Health, 100)
	applyBodyScale(character, Vector3.new(1, 1, 1))
end

local function spawnAura(character, color)
	-- Creates a billboard aura part at the HumanoidRootPart
	local root = character:FindFirstChild("HumanoidRootPart")
	if not root then return end

	local existingAura = root:FindFirstChild("ResurreccionAura")
	if existingAura then existingAura:Destroy() end

	local aura = Instance.new("Part")
	aura.Name = "ResurreccionAura"
	aura.Size = Vector3.new(6, 8, 6)
	aura.CFrame = root.CFrame
	aura.Anchored = false
	aura.CanCollide = false
	aura.Transparency = 0.6
	aura.Material = Enum.Material.Neon
	aura.Color = color
	aura.Parent = character

	local weld = Instance.new("WeldConstraint")
	weld.Part0 = root
	weld.Part1 = aura
	weld.Parent = aura

	-- Pulse effect via TweenService
	local TweenService = game:GetService("TweenService")
	local tweenInfo = TweenInfo.new(1, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)
	TweenService:Create(aura, tweenInfo, { Transparency = 0.85 }):Play()

	return aura
end

local function removeAura(character)
	local root = character:FindFirstChild("HumanoidRootPart")
	if root then
		local aura = root:FindFirstChild("ResurreccionAura")
		if aura then aura:Destroy() end
	end
	-- Also check directly on character
	local aura = character:FindFirstChild("ResurreccionAura")
	if aura then aura:Destroy() end
end

local function unlockAbilities(player, abilities)
	-- Write unlocked ability names into player's AbilityFolder so the client can display them
	local abilityFolder = player:FindFirstChild("AbilityFolder")
	if not abilityFolder then
		abilityFolder = Instance.new("Folder")
		abilityFolder.Name = "AbilityFolder"
		abilityFolder.Parent = player
	end
	-- Clear old
	for _, child in ipairs(abilityFolder:GetChildren()) do child:Destroy() end
	-- Add new
	for _, abilityName in ipairs(abilities) do
		local v = Instance.new("StringValue")
		v.Name = abilityName
		v.Value = abilityName
		v.Parent = abilityFolder
	end
end

local function clearAbilities(player)
	local abilityFolder = player:FindFirstChild("AbilityFolder")
	if abilityFolder then
		for _, child in ipairs(abilityFolder:GetChildren()) do child:Destroy() end
	end
end

-- ──────────────────────────────────────────────
--  Resurreccion Activation
-- ──────────────────────────────────────────────

ActivateResurreccion.OnServerEvent:Connect(function(player)
	local profile = getCharacterProfile(player)
	if not profile or profile.race ~= "Arrancar" then
		warn(player.Name .. " tried to activate Resurreccion but is not an Arrancar.")
		return
	end

	if activeResurreccion[player] then
		warn(player.Name .. " is already in Resurreccion.")
		return
	end

	local espadaName = profile.espadaName
	local formData = ResurreccionData.Get(espadaName)
	if not formData then
		warn("No Resurreccion data found for: " .. tostring(espadaName))
		return
	end

	local character = player.Character
	if not character then return end

	-- Apply transformation
	applyBodyScale(character, formData.BodyScale)
	applyStatMultipliers(character, formData)
	spawnAura(character, formData.AuraColor)
	unlockAbilities(player, formData.Abilities)

	activeResurreccion[player] = {
		formData      = formData,
		espadaName    = espadaName,
		tickActivated = tick(),
		isSegunda     = false,
	}

	print(player.Name .. " released Resurreccion: " .. formData.ResurreccionName)

	-- Broadcast release animation trigger to all clients
	ActivateResurreccion:FireAllClients(player, formData)
end)

-- ──────────────────────────────────────────────
--  Segunda Etapa (Ulquiorra only)
-- ──────────────────────────────────────────────

ActivateSegundaEtapa.OnServerEvent:Connect(function(player)
	local session = activeResurreccion[player]
	if not session then return end
	if session.espadaName ~= "Ulquiorra" then return end
	if session.isSegunda then return end

	local segunda = session.formData.SegundaEtapa
	if not segunda then return end

	local character = player.Character
	if not character then return end

	applyBodyScale(character, segunda.BodyScale)
	applyStatMultipliers(character, segunda)
	removeAura(character)
	spawnAura(character, segunda.AuraColor)
	unlockAbilities(player, segunda.Abilities)

	session.isSegunda = true

	print(player.Name .. " activated Segunda Etapa!")
	ActivateSegundaEtapa:FireAllClients(player, segunda)
end)

-- ──────────────────────────────────────────────
--  Deactivation
-- ──────────────────────────────────────────────

DeactivateResurreccion.OnServerEvent:Connect(function(player)
	if not activeResurreccion[player] then return end

	local character = player.Character
	if character then
		resetStats(character)
		removeAura(character)
	end
	clearAbilities(player)
	activeResurreccion[player] = nil

	print(player.Name .. " deactivated Resurreccion.")
	DeactivateResurreccion:FireAllClients(player)
end)

-- ──────────────────────────────────────────────
--  Ability Usage
-- ──────────────────────────────────────────────

local AbilityHandlers = require(ReplicatedStorage.Modules.AbilityHandlers)

UseAbility.OnServerEvent:Connect(function(player, abilityName, targetPosition)
	local session = activeResurreccion[player]
	if not session then return end

	-- Validate the ability is actually unlocked for this player
	local abilityFolder = player:FindFirstChild("AbilityFolder")
	if not abilityFolder or not abilityFolder:FindFirstChild(abilityName) then
		warn(player.Name .. " tried to use unlocked ability: " .. tostring(abilityName))
		return
	end

	local handler = AbilityHandlers[abilityName]
	if handler then
		handler(player, targetPosition, session.formData)
	else
		warn("No handler for ability: " .. abilityName)
	end
end)

-- ──────────────────────────────────────────────
--  Cleanup on player leave
-- ──────────────────────────────────────────────

Players.PlayerRemoving:Connect(function(player)
	activeResurreccion[player] = nil
end)
