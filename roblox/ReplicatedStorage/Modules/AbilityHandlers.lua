-- AbilityHandlers.lua
-- Server-side logic for each Resurreccion ability

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")
local Debris = game:GetService("Debris")

local CERO_SPEED    = 120
local BALA_SPEED    = 300
local CERO_DAMAGE   = 60
local BALA_DAMAGE   = 15

local function getRoot(player)
	local char = player.Character
	return char and char:FindFirstChild("HumanoidRootPart")
end

local function getDamageMultiplier(player)
	local profile = player:FindFirstChild("Profile")
	if not profile then return 1 end
	local v = profile:FindFirstChild("DamageMultiplier")
	return v and v.Value or 1
end

local function fireProjectile(origin, direction, speed, size, color, damage, lifetime)
	local part = Instance.new("Part")
	part.Size = size
	part.CFrame = CFrame.new(origin, origin + direction)
	part.Velocity = direction.Unit * speed
	part.BrickColor = BrickColor.new(color)
	part.Material = Enum.Material.Neon
	part.CanCollide = false
	part.Anchored = false
	part.Parent = workspace
	Debris:AddItem(part, lifetime)

	part.Touched:Connect(function(hit)
		local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")
		if humanoid and hit.Parent ~= part.Parent then
			humanoid:TakeDamage(damage)
			part:Destroy()
		end
	end)

	return part
end

local function dealAoEDamage(center, radius, damage, sourcePlayer)
	for _, player in ipairs(Players:GetPlayers()) do
		if player == sourcePlayer then continue end
		local char = player.Character
		if not char then continue end
		local root = char:FindFirstChild("HumanoidRootPart")
		local humanoid = char:FindFirstChildOfClass("Humanoid")
		if root and humanoid and (root.Position - center).Magnitude <= radius then
			humanoid:TakeDamage(damage)
		end
	end
end

-- ──────────────────────────────────────────────
--  Shared Abilities
-- ──────────────────────────────────────────────

local Handlers = {}

function Handlers.Cero(player, targetPos, formData)
	local root = getRoot(player)
	if not root then return end
	local direction = (targetPos - root.Position)
	local dmg = CERO_DAMAGE * (formData.DamageMultiplier or 1) * getDamageMultiplier(player)
	fireProjectile(root.Position, direction, CERO_SPEED, Vector3.new(1.5, 1.5, 6), "Really red", dmg, 5)
end

function Handlers.Bala(player, targetPos, formData)
	local root = getRoot(player)
	if not root then return end
	local direction = (targetPos - root.Position)
	local dmg = BALA_DAMAGE * (formData.DamageMultiplier or 1) * getDamageMultiplier(player)
	-- Bala fires a rapid burst of 5
	for i = 1, 5 do
		task.delay(i * 0.05, function()
			if root and root.Parent then
				local spread = Vector3.new(math.random(-2, 2), 0, math.random(-2, 2))
				fireProjectile(root.Position, direction + spread, BALA_SPEED, Vector3.new(0.5, 0.5, 2), "Bright orange", dmg, 2)
			end
		end)
	end
end

-- ──────────────────────────────────────────────
--  Starrk – Los Lobos
-- ──────────────────────────────────────────────

function Handlers.CeroPistola(player, targetPos, formData)
	-- Rapid-fire Cero from both pistols
	local root = getRoot(player)
	if not root then return end
	local dmg = 45 * getDamageMultiplier(player)
	for i = 1, 8 do
		task.delay(i * 0.1, function()
			if root and root.Parent then
				local dir = (targetPos - root.Position) + Vector3.new(math.random(-1, 1), 0, math.random(-1, 1))
				fireProjectile(root.Position, dir, CERO_SPEED * 1.2, Vector3.new(1, 1, 4), "Bright blue", dmg, 4)
			end
		end)
	end
end

function Handlers.CeroMetralleta(player, targetPos, formData)
	-- Full-auto: 20 Ceros in 2 seconds in a cone
	local root = getRoot(player)
	if not root then return end
	local dmg = 30 * getDamageMultiplier(player)
	for i = 1, 20 do
		task.delay(i * 0.1, function()
			if root and root.Parent then
				local spread = Vector3.new(math.random(-5, 5), math.random(-2, 2), math.random(-5, 5))
				local dir = (targetPos - root.Position) + spread
				fireProjectile(root.Position, dir, CERO_SPEED, Vector3.new(0.8, 0.8, 3), "Bright blue", dmg, 3)
			end
		end)
	end
end

function Handlers.LosLobosWolves(player, targetPos, formData)
	-- Spawns 5 wolf NPCs that chase the nearest enemy (stub – requires NPC module)
	print("[LosLobosWolves] Summoning wolves for " .. player.Name)
	-- Full NPC AI is in WolfNPC module; fire a signal for now
	local Events = ReplicatedStorage:FindFirstChild("Events")
	if Events then
		local e = Events:FindFirstChild("SpawnWolves")
		if e then e:Fire(player, targetPos) end
	end
end

-- ──────────────────────────────────────────────
--  Barragan – Arrogante
-- ──────────────────────────────────────────────

function Handlers.Respira(player, targetPos, formData)
	-- Persistent decay aura: anything within 8 studs takes damage every second
	local root = getRoot(player)
	if not root then return end

	local duration = 6
	local startTime = tick()

	local conn
	conn = game:GetService("RunService").Heartbeat:Connect(function()
		if tick() - startTime >= duration then conn:Disconnect() return end
		if not root or not root.Parent then conn:Disconnect() return end
		dealAoEDamage(root.Position, 8, 5, player)
	end)
end

function Handlers.Senescencia(player, targetPos, formData)
	-- Slows all enemies in 20-stud radius for 4 seconds
	for _, target in ipairs(Players:GetPlayers()) do
		if target == player then continue end
		local char = target.Character
		if not char then continue end
		local root = char:FindFirstChild("HumanoidRootPart")
		local humanoid = char:FindFirstChildOfClass("Humanoid")
		local playerRoot = getRoot(player)
		if root and humanoid and playerRoot and (root.Position - playerRoot.Position).Magnitude <= 20 then
			local originalSpeed = humanoid.WalkSpeed
			humanoid.WalkSpeed = originalSpeed * 0.1
			task.delay(4, function()
				if humanoid and humanoid.Parent then
					humanoid.WalkSpeed = originalSpeed
				end
			end)
		end
	end
end

function Handlers.AgingField(player, targetPos, formData)
	Handlers.Respira(player, targetPos, formData) -- shares decay logic
end

-- ──────────────────────────────────────────────
--  Harribel – Tiburon
-- ──────────────────────────────────────────────

function Handlers.TijeraShark(player, targetPos, formData)
	local root = getRoot(player)
	if not root then return end
	-- Spawns two crossing water slashes
	local dmg = 70 * getDamageMultiplier(player)
	local dir = (targetPos - root.Position).Unit
	local right = dir:Cross(Vector3.new(0, 1, 0))
	for _, offset in ipairs({ right * 2, -right * 2 }) do
		local slash = Instance.new("Part")
		slash.Size = Vector3.new(1, 8, 0.3)
		slash.CFrame = CFrame.new(root.Position + offset, root.Position + offset + dir)
		slash.Velocity = dir * 80
		slash.Material = Enum.Material.Neon
		slash.BrickColor = BrickColor.new("Cyan")
		slash.CanCollide = false
		slash.Parent = workspace
		Debris:AddItem(slash, 3)
		slash.Touched:Connect(function(hit)
			local h = hit.Parent:FindFirstChildOfClass("Humanoid")
			if h and hit.Parent ~= player.Character then
				h:TakeDamage(dmg)
				slash:Destroy()
			end
		end)
	end
end

function Handlers.TorrienteWave(player, targetPos, formData)
	-- Massive wave AoE in front of player
	local root = getRoot(player)
	if not root then return end
	local dmg = 120 * getDamageMultiplier(player)
	local dir = (targetPos - root.Position).Unit
	local waveOrigin = root.Position + dir * 5
	dealAoEDamage(waveOrigin, 25, dmg, player)

	local wave = Instance.new("Part")
	wave.Size = Vector3.new(20, 10, 3)
	wave.CFrame = CFrame.new(waveOrigin, waveOrigin + dir)
	wave.Anchored = false
	wave.Velocity = dir * 60
	wave.Material = Enum.Material.Neon
	wave.BrickColor = BrickColor.new("Cyan")
	wave.CanCollide = false
	wave.Parent = workspace
	Debris:AddItem(wave, 3)
end

function Handlers.LaGota(player, targetPos, formData)
	local root = getRoot(player)
	if not root then return end
	local dmg = 80 * getDamageMultiplier(player)
	fireProjectile(root.Position, (targetPos - root.Position), 60, Vector3.new(3, 3, 3), "Cyan", dmg, 6)
end

-- ──────────────────────────────────────────────
--  Ulquiorra – Murciélago / Segunda Etapa
-- ──────────────────────────────────────────────

function Handlers.CeroOscuras(player, targetPos, formData)
	local root = getRoot(player)
	if not root then return end
	local dmg = 100 * getDamageMultiplier(player)
	fireProjectile(root.Position, (targetPos - root.Position), CERO_SPEED * 0.8, Vector3.new(3, 3, 10), "Really black", dmg, 6)
end

function Handlers.LanzaDelRelampago(player, targetPos, formData)
	local root = getRoot(player)
	if not root then return end
	local dmg = 150 * getDamageMultiplier(player)
	-- Fires a lance that explodes on impact
	local lance = fireProjectile(root.Position, (targetPos - root.Position), 150, Vector3.new(1, 1, 8), "Bright green", dmg, 4)
	local touched = false
	lance.Touched:Connect(function(hit)
		if touched then return end
		touched = true
		-- AoE explosion
		dealAoEDamage(lance.Position, 12, dmg * 0.5, player)
		lance:Destroy()
	end)
end

function Handlers.HellstormLance(player, targetPos, formData)
	-- Fires three LanzaDelRelampago simultaneously
	for i = -1, 1 do
		local offset = Vector3.new(i * 3, 0, 0)
		task.delay(math.abs(i) * 0.15, function()
			local root = getRoot(player)
			if root then
				Handlers.LanzaDelRelampago(player, targetPos + offset, formData)
			end
		end)
	end
end

function Handlers.SegundaEtapa(player, targetPos, formData)
	-- Triggers the transition on the server (called from client input)
	local Events = ReplicatedStorage:FindFirstChild("Events")
	if Events then
		local e = Events:FindFirstChild("ActivateSegundaEtapa")
		if e then e:FireServer() end
	end
end

-- ──────────────────────────────────────────────
--  Grimmjow – Pantera
-- ──────────────────────────────────────────────

function Handlers.GranzRei(player, targetPos, formData)
	local root = getRoot(player)
	if not root then return end
	local dmg = 25 * getDamageMultiplier(player)
	-- 10 claw projectiles in a spread
	for i = 1, 10 do
		task.delay(i * 0.05, function()
			if root and root.Parent then
				local spread = Vector3.new(math.random(-8, 8), math.random(-3, 3), math.random(-8, 8))
				local dir = (targetPos - root.Position) + spread
				fireProjectile(root.Position, dir, 100, Vector3.new(0.4, 0.4, 2), "Bright blue", dmg, 3)
			end
		end)
	end
end

function Handlers.DesgarronClaws(player, targetPos, formData)
	local root = getRoot(player)
	if not root then return end
	local dmg = 200 * getDamageMultiplier(player)
	-- Five massive claw slashes in a wide arc
	local dir = (targetPos - root.Position).Unit
	for i = -2, 2 do
		local angleOffset = CFrame.Angles(0, math.rad(i * 20), 0)
		local slashDir = angleOffset:VectorToWorldSpace(dir)
		task.delay(math.abs(i) * 0.05, function()
			local slash = Instance.new("Part")
			slash.Size = Vector3.new(2, 15, 0.5)
			slash.CFrame = CFrame.new(root.Position + slashDir * 5, root.Position + slashDir * 15)
			slash.Velocity = slashDir * 90
			slash.Material = Enum.Material.Neon
			slash.BrickColor = BrickColor.new("Bright blue")
			slash.CanCollide = false
			slash.Parent = workspace
			Debris:AddItem(slash, 2)
			slash.Touched:Connect(function(hit)
				local h = hit.Parent:FindFirstChildOfClass("Humanoid")
				if h and hit.Parent ~= player.Character then
					h:TakeDamage(dmg)
					slash:Destroy()
				end
			end)
		end)
	end
end

-- ──────────────────────────────────────────────
--  Nnoitra – Santa Teresa
-- ──────────────────────────────────────────────

function Handlers.SantaTeresaSlash(player, targetPos, formData)
	-- Six-hit scythe combo
	local root = getRoot(player)
	if not root then return end
	local dmg = 40 * getDamageMultiplier(player)
	for i = 1, 6 do
		task.delay(i * 0.12, function()
			if root and root.Parent then
				dealAoEDamage(root.Position + root.CFrame.LookVector * 4, 5, dmg, player)
			end
		end)
	end
end

-- ──────────────────────────────────────────────
--  Yammy – Ira
-- ──────────────────────────────────────────────

function Handlers.GargantaMassive(player, targetPos, formData)
	-- Opens a massive Garganta that fires a beam
	local root = getRoot(player)
	if not root then return end
	local dmg = 300 * getDamageMultiplier(player)
	fireProjectile(root.Position, (targetPos - root.Position), 80, Vector3.new(6, 6, 15), "Really black", dmg, 8)
end

function Handlers.IraBelch(player, targetPos, formData)
	-- AoE slam that grows Yammy if it KOs enemies (stat increase handled separately)
	local root = getRoot(player)
	if not root then return end
	local dmg = 180 * getDamageMultiplier(player)
	dealAoEDamage(root.Position, 20, dmg, player)
end

-- ──────────────────────────────────────────────
--  Szayelaporro – Fornicarás
-- ──────────────────────────────────────────────

function Handlers.GabrielBirth(player, targetPos, formData)
	-- Full heal (rebirth mechanic)
	local char = player.Character
	if not char then return end
	local humanoid = char:FindFirstChildOfClass("Humanoid")
	if humanoid then
		humanoid.Health = humanoid.MaxHealth
		print(player.Name .. " used Gabriel – fully healed!")
	end
end

function Handlers.TentacleGrasp(player, targetPos, formData)
	-- Slows and deals damage to nearest enemy
	local root = getRoot(player)
	if not root then return end
	local dmg = 60 * getDamageMultiplier(player)
	dealAoEDamage(root.Position, 15, dmg, player)
	-- Apply slow
	for _, target in ipairs(Players:GetPlayers()) do
		if target == player then continue end
		local char = target.Character
		if not char then continue end
		local tRoot = char:FindFirstChild("HumanoidRootPart")
		local h = char:FindFirstChildOfClass("Humanoid")
		if tRoot and h and (tRoot.Position - root.Position).Magnitude <= 15 then
			local orig = h.WalkSpeed
			h.WalkSpeed = 2
			task.delay(3, function()
				if h and h.Parent then h.WalkSpeed = orig end
			end)
		end
	end
end

function Handlers.ReiatsuDrain(player, targetPos, formData)
	-- Drains Reiatsu from nearby enemies and heals the player
	local root = getRoot(player)
	if not root then return end
	local char = player.Character
	local myHumanoid = char and char:FindFirstChildOfClass("Humanoid")
	for _, target in ipairs(Players:GetPlayers()) do
		if target == player then continue end
		local tChar = target.Character
		if not tChar then continue end
		local tRoot = tChar:FindFirstChild("HumanoidRootPart")
		local tHumanoid = tChar:FindFirstChildOfClass("Humanoid")
		if tRoot and tHumanoid and (tRoot.Position - root.Position).Magnitude <= 12 then
			local drain = 30
			tHumanoid:TakeDamage(drain)
			if myHumanoid then
				myHumanoid.Health = math.min(myHumanoid.MaxHealth, myHumanoid.Health + drain)
			end
		end
	end
end

-- ──────────────────────────────────────────────
--  Aaroniero – Glotonería
-- ──────────────────────────────────────────────

function Handlers.TentacleSwarm(player, targetPos, formData)
	Handlers.TentacleGrasp(player, targetPos, formData) -- reuse grab logic
end

function Handlers.AbsorbAbility(player, targetPos, formData)
	-- Stub: grants a random ability from a defeated hollow (requires kill tracking)
	print("[AbsorbAbility] Aaroniero absorbs a hollow ability – extend with kill-tracking system.")
end

-- ──────────────────────────────────────────────
--  Zommari – Brujería
-- ──────────────────────────────────────────────

function Handlers.Amor(player, targetPos, formData)
	-- Reverses movement controls for the nearest enemy for 3 seconds
	local root = getRoot(player)
	if not root then return end
	local closest, closestDist = nil, math.huge
	for _, target in ipairs(Players:GetPlayers()) do
		if target == player then continue end
		local tRoot = target.Character and target.Character:FindFirstChild("HumanoidRootPart")
		if tRoot then
			local dist = (tRoot.Position - root.Position).Magnitude
			if dist < closestDist then
				closest = target
				closestDist = dist
			end
		end
	end
	if closest then
		local Events = ReplicatedStorage:FindFirstChild("Events")
		if Events then
			local amorEvent = Events:FindFirstChild("AmorControl")
			if amorEvent then amorEvent:FireClient(closest, 3) end
		end
	end
end

return Handlers
