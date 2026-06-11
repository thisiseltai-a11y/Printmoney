-- ResurreccionClient.client.lua
-- Handles Resurreccion input, UI, and visual effects on the local client

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local camera = workspace.CurrentCamera

local Events = ReplicatedStorage:WaitForChild("Events")
local ActivateResurreccion   = Events:WaitForChild("ActivateResurreccion")
local DeactivateResurreccion = Events:WaitForChild("DeactivateResurreccion")
local ActivateSegundaEtapa   = Events:WaitForChild("ActivateSegundaEtapa")
local UseAbility             = Events:WaitForChild("UseAbility")
local AmorControl            = Events:WaitForChild("AmorControl")

local isInResurreccion = false
local isInSegunda = false
local amorActive = false

-- Ability keybinds (1-4 keys map to the 4 unlocked abilities)
local abilityKeys = {
	[Enum.KeyCode.Z] = 1,
	[Enum.KeyCode.X] = 2,
	[Enum.KeyCode.C] = 3,
	[Enum.KeyCode.V] = 4,
}

local abilityCooldowns = {}  -- [slotIndex] = lastUsedTick

local ABILITY_COOLDOWN = 8  -- seconds between ability uses

-- ──────────────────────────────────────────────
--  Screen Flash Effect
-- ──────────────────────────────────────────────

local function screenFlash(color)
	local screenGui = Instance.new("ScreenGui")
	screenGui.IgnoreGuiInset = true
	screenGui.ResetOnSpawn = false
	screenGui.Parent = player.PlayerGui

	local frame = Instance.new("Frame")
	frame.Size = UDim2.fromScale(1, 1)
	frame.BackgroundColor3 = color
	frame.BackgroundTransparency = 0
	frame.BorderSizePixel = 0
	frame.Parent = screenGui

	TweenService:Create(frame, TweenInfo.new(1.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		BackgroundTransparency = 1,
	}):Play()

	task.delay(2, function() screenGui:Destroy() end)
end

-- ──────────────────────────────────────────────
--  Ability Bar UI
-- ──────────────────────────────────────────────

local abilityGui = nil
local abilitySlots = {}

local function buildAbilityBar(abilities)
	if abilityGui then abilityGui:Destroy() end

	abilityGui = Instance.new("ScreenGui")
	abilityGui.Name = "ResurreccionAbilityBar"
	abilityGui.ResetOnSpawn = false
	abilityGui.Parent = player.PlayerGui

	local frame = Instance.new("Frame")
	frame.Size = UDim2.new(0, #abilities * 90, 0, 80)
	frame.Position = UDim2.new(0.5, -(#abilities * 45), 1, -100)
	frame.BackgroundTransparency = 1
	frame.Parent = abilityGui

	local layout = Instance.new("UIListLayout")
	layout.FillDirection = Enum.FillDirection.Horizontal
	layout.Padding = UDim.new(0, 10)
	layout.Parent = frame

	abilitySlots = {}
	local keyNames = { "Z", "X", "C", "V" }

	for i, abilityName in ipairs(abilities) do
		local slot = Instance.new("Frame")
		slot.Size = UDim2.new(0, 80, 0, 80)
		slot.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
		slot.BackgroundTransparency = 0.3
		slot.Parent = frame

		local corner = Instance.new("UICorner")
		corner.CornerRadius = UDim.new(0, 8)
		corner.Parent = slot

		local label = Instance.new("TextLabel")
		label.Size = UDim2.fromScale(1, 0.6)
		label.Position = UDim2.fromScale(0, 0.1)
		label.BackgroundTransparency = 1
		label.Text = abilityName:sub(1, 10)
		label.TextColor3 = Color3.new(1, 1, 1)
		label.TextScaled = true
		label.Font = Enum.Font.GothamBold
		label.Parent = slot

		local keyLabel = Instance.new("TextLabel")
		keyLabel.Size = UDim2.new(1, 0, 0.3, 0)
		keyLabel.Position = UDim2.fromScale(0, 0.7)
		keyLabel.BackgroundTransparency = 1
		keyLabel.Text = "[" .. (keyNames[i] or "?") .. "]"
		keyLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
		keyLabel.TextScaled = true
		keyLabel.Font = Enum.Font.Gotham
		keyLabel.Parent = slot

		-- Cooldown overlay
		local cooldownOverlay = Instance.new("Frame")
		cooldownOverlay.Name = "CooldownOverlay"
		cooldownOverlay.Size = UDim2.fromScale(1, 0)
		cooldownOverlay.Position = UDim2.fromScale(0, 1)
		cooldownOverlay.AnchorPoint = Vector2.new(0, 1)
		cooldownOverlay.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
		cooldownOverlay.BackgroundTransparency = 0.5
		cooldownOverlay.BorderSizePixel = 0
		cooldownOverlay.ZIndex = 2
		cooldownOverlay.Parent = slot

		abilitySlots[i] = { slot = slot, overlay = cooldownOverlay, abilityName = abilityName }
	end
end

local function removeAbilityBar()
	if abilityGui then
		abilityGui:Destroy()
		abilityGui = nil
		abilitySlots = {}
	end
end

local function showCooldown(slotIndex)
	local slotData = abilitySlots[slotIndex]
	if not slotData then return end
	local overlay = slotData.overlay
	overlay.Size = UDim2.fromScale(1, 1)
	TweenService:Create(overlay, TweenInfo.new(ABILITY_COOLDOWN, Enum.EasingStyle.Linear), {
		Size = UDim2.fromScale(1, 0),
	}):Play()
end

-- ──────────────────────────────────────────────
--  Resurreccion Release Cinematic
-- ──────────────────────────────────────────────

local function playReleaseEffect(formData)
	screenFlash(formData.AuraColor)

	-- Shake camera
	local originalCFrame = camera.CFrame
	for i = 1, 20 do
		task.wait(0.05)
		local shake = Vector3.new(math.random(-1, 1) * 0.3, math.random(-1, 1) * 0.3, 0)
		camera.CFrame = camera.CFrame + shake
	end
end

-- ──────────────────────────────────────────────
--  Server → Client Events
-- ──────────────────────────────────────────────

ActivateResurreccion.OnClientEvent:Connect(function(who, formData)
	if who == player then
		isInResurreccion = true
		playReleaseEffect(formData)
		buildAbilityBar(formData.Abilities)
	end
end)

DeactivateResurreccion.OnClientEvent:Connect(function(who)
	if who == player then
		isInResurreccion = false
		isInSegunda = false
		removeAbilityBar()
	end
end)

ActivateSegundaEtapa.OnClientEvent:Connect(function(who, segData)
	if who == player then
		isInSegunda = true
		screenFlash(segData.AuraColor)
		buildAbilityBar(segData.Abilities)
	end
end)

-- Zommari Amor – reverses client input for N seconds
AmorControl.OnClientEvent:Connect(function(duration)
	amorActive = true
	task.delay(duration, function() amorActive = false end)
end)

-- ──────────────────────────────────────────────
--  Input
-- ──────────────────────────────────────────────

UserInputService.InputBegan:Connect(function(input, gameProcessed)
	if gameProcessed then return end

	-- G = Release / Seal Resurreccion
	if input.KeyCode == Enum.KeyCode.G then
		if isInResurreccion then
			DeactivateResurreccion:FireServer()
		else
			ActivateResurreccion:FireServer()
		end
		return
	end

	-- T = Segunda Etapa (Ulquiorra only, requires Resurreccion active)
	if input.KeyCode == Enum.KeyCode.T and isInResurreccion and not isInSegunda then
		ActivateSegundaEtapa:FireServer()
		return
	end

	-- Ability keys Z/X/C/V
	local slotIndex = abilityKeys[input.KeyCode]
	if slotIndex and isInResurreccion then
		local now = tick()
		local lastUsed = abilityCooldowns[slotIndex] or 0
		if now - lastUsed < ABILITY_COOLDOWN then return end

		local slotData = abilitySlots[slotIndex]
		if not slotData then return end

		abilityCooldowns[slotIndex] = now
		showCooldown(slotIndex)

		-- Determine target position (mouse hit)
		local mouse = player:GetMouse()
		local targetPos = mouse.Hit and mouse.Hit.Position or Vector3.new(0, 0, 0)

		-- Apply Amor control reversal
		if amorActive then
			targetPos = character.HumanoidRootPart.Position - (targetPos - character.HumanoidRootPart.Position)
		end

		UseAbility:FireServer(slotData.abilityName, targetPos)
	end
end)

-- ──────────────────────────────────────────────
--  HUD status label
-- ──────────────────────────────────────────────

local statusGui = Instance.new("ScreenGui")
statusGui.Name = "ResurreccionStatus"
statusGui.ResetOnSpawn = false
statusGui.Parent = player.PlayerGui

local statusLabel = Instance.new("TextLabel")
statusLabel.Size = UDim2.new(0, 300, 0, 30)
statusLabel.Position = UDim2.new(0.5, -150, 0, 10)
statusLabel.BackgroundTransparency = 0.5
statusLabel.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
statusLabel.TextColor3 = Color3.new(1, 1, 1)
statusLabel.Font = Enum.Font.GothamBold
statusLabel.TextScaled = true
statusLabel.Text = "Press [G] to release Resurreccion"
statusLabel.Parent = statusGui

ActivateResurreccion.OnClientEvent:Connect(function(who, formData)
	if who == player then
		statusLabel.Text = formData.ResurreccionName .. " — [G] Seal | [Z/X/C/V] Abilities"
	end
end)

DeactivateResurreccion.OnClientEvent:Connect(function(who)
	if who == player then
		statusLabel.Text = "Press [G] to release Resurreccion"
	end
end)

ActivateSegundaEtapa.OnClientEvent:Connect(function(who, segData)
	if who == player then
		statusLabel.Text = "Segunda Etapa — [Z/X/C] Abilities"
	end
end)
