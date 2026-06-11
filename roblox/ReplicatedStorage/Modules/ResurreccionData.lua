-- ResurreccionData.lua
-- All Arrancar Resurreccion definitions: stats, abilities, visuals

local ResurreccionData = {}

ResurreccionData.Forms = {

	-- Tier 1 Espada (Cero Espada - Yammy)
	Yammy = {
		EspadaNumber = 0,
		ResurreccionName = "Ira",
		ReleaseCommand = "Rage",
		BodyScale = Vector3.new(4, 4, 4),
		SpeedMultiplier = 1.2,
		ReiatsuMultiplier = 5.0,
		DamageMultiplier = 4.5,
		DefenseMultiplier = 4.0,
		AuraColor = Color3.fromRGB(200, 0, 0),
		Abilities = {
			"Bala",
			"Cero",
			"GargantaMassive",
			"IraBelch", -- absorbs Reiatsu from defeated enemies to grow bigger
		},
	},

	-- Primera Espada (Starrk)
	Starrk = {
		EspadaNumber = 1,
		ResurreccionName = "Los Lobos",
		ReleaseCommand = "Kick About",
		BodyScale = Vector3.new(1.1, 1.1, 1.1),
		SpeedMultiplier = 2.5,
		ReiatsuMultiplier = 4.0,
		DamageMultiplier = 3.8,
		DefenseMultiplier = 2.5,
		AuraColor = Color3.fromRGB(80, 80, 200),
		Abilities = {
			"CeroPistola",     -- rapid-fire Cero from pistols
			"CeroMetralleta",  -- full-auto Cero barrage
			"LosLobosWolves",  -- summon Lilynette wolves
			"Bala",
		},
	},

	-- Segunda Espada (Barragan)
	Barragan = {
		EspadaNumber = 2,
		ResurreccionName = "Arrogante",
		ReleaseCommand = "Rot",
		BodyScale = Vector3.new(1.5, 1.5, 1.5),
		SpeedMultiplier = 1.0,
		ReiatsuMultiplier = 3.8,
		DamageMultiplier = 3.5,
		DefenseMultiplier = 5.0,
		AuraColor = Color3.fromRGB(80, 80, 80),
		Abilities = {
			"Respira",      -- aura of decay, degrades anything it touches
			"AgingField",   -- ages projectiles/opponents on contact
			"Senescencia",  -- stops time relative to target
			"Bala",
		},
	},

	-- Tercera Espada (Harribel)
	Harribel = {
		EspadaNumber = 3,
		ResurreccionName = "Tiburon",
		ReleaseCommand = "Search and Destroy",
		BodyScale = Vector3.new(1.1, 1.2, 1.1),
		SpeedMultiplier = 2.0,
		ReiatsuMultiplier = 3.5,
		DamageMultiplier = 3.2,
		DefenseMultiplier = 3.0,
		AuraColor = Color3.fromRGB(255, 220, 0),
		Abilities = {
			"TijeraShark",    -- water slash
			"LaGota",         -- water drop blast
			"TorrienteWave",  -- massive water wave
			"Cero",
		},
	},

	-- Cuarta Espada (Ulquiorra)
	Ulquiorra = {
		EspadaNumber = 4,
		ResurreccionName = "Murciélago",
		ReleaseCommand = "Enclose",
		BodyScale = Vector3.new(1.2, 1.2, 1.2),
		SpeedMultiplier = 2.8,
		ReiatsuMultiplier = 3.8,
		DamageMultiplier = 3.5,
		DefenseMultiplier = 3.0,
		AuraColor = Color3.fromRGB(0, 180, 0),
		Abilities = {
			"CeroOscuras",       -- black Cero
			"LanzaDelRelampago", -- lightning lance
			"Bala",
			"SegundaEtapa",      -- unlocks Segunda Etapa form
		},
		SegundaEtapa = {
			Name = "Segunda Etapa",
			BodyScale = Vector3.new(1.5, 1.5, 1.5),
			SpeedMultiplier = 3.5,
			ReiatsuMultiplier = 5.5,
			DamageMultiplier = 5.0,
			DefenseMultiplier = 4.0,
			AuraColor = Color3.fromRGB(0, 255, 0),
			Abilities = {
				"CeroOscuras",
				"LanzaDelRelampago",
				"HellstormLance",
			},
		},
	},

	-- Quinta Espada (Nnoitra)
	Nnoitra = {
		EspadaNumber = 5,
		ResurreccionName = "Santa Teresa",
		ReleaseCommand = "Pray",
		BodyScale = Vector3.new(1.3, 1.6, 1.3),
		SpeedMultiplier = 2.2,
		ReiatsuMultiplier = 3.0,
		DamageMultiplier = 3.8,
		DefenseMultiplier = 4.5,
		AuraColor = Color3.fromRGB(200, 200, 200),
		Abilities = {
			"SantaTeresaSlash", -- six-arm scythe combo
			"HieraBlast",       -- Hierro-enhanced punch
			"RegenerateArmor",  -- passive Hierro regeneration
			"Bala",
		},
	},

	-- Sexta Espada (Grimmjow)
	Grimmjow = {
		EspadaNumber = 6,
		ResurreccionName = "Pantera",
		ReleaseCommand = "Grind",
		BodyScale = Vector3.new(1.2, 1.2, 1.2),
		SpeedMultiplier = 3.0,
		ReiatsuMultiplier = 2.8,
		DamageMultiplier = 3.5,
		DefenseMultiplier = 2.5,
		AuraColor = Color3.fromRGB(0, 120, 255),
		Abilities = {
			"GranzRei",         -- claw projectile barrage
			"DesgarronClaws",   -- massive claw slash AoE
			"PanteraSpeed",     -- passive extreme speed burst
			"Bala",
			"Cero",
		},
	},

	-- Séptima Espada (Zommari)
	Zommari = {
		EspadaNumber = 7,
		ResurreccionName = "Brujería",
		ReleaseCommand = "Suppress",
		BodyScale = Vector3.new(1.1, 1.1, 1.1),
		SpeedMultiplier = 3.5,
		ReiatsuMultiplier = 2.5,
		DamageMultiplier = 2.5,
		DefenseMultiplier = 2.5,
		AuraColor = Color3.fromRGB(255, 100, 200),
		Abilities = {
			"Amor",          -- eyes on body that take control of hit body parts
			"SpeedBoost",
			"Bala",
		},
	},

	-- Octava Espada (Szayelaporro)
	Szayelaporro = {
		EspadaNumber = 8,
		ResurreccionName = "Fornicarás",
		ReleaseCommand = "Sip",
		BodyScale = Vector3.new(1.1, 1.1, 1.1),
		SpeedMultiplier = 1.8,
		ReiatsuMultiplier = 2.5,
		DamageMultiplier = 2.8,
		DefenseMultiplier = 2.5,
		AuraColor = Color3.fromRGB(200, 0, 200),
		Abilities = {
			"GabrielBirth",    -- rebirth inside a body for full heal
			"TentacleGrasp",   -- ranged grab
			"ReiatsuDrain",    -- drain opponent Reiatsu
			"Bala",
		},
	},

	-- Novena Espada (Aaroniero)
	Aaroniero = {
		EspadaNumber = 9,
		ResurreccionName = "Glotonería",
		ReleaseCommand = "Devour",
		BodyScale = Vector3.new(2.0, 3.0, 2.0),
		SpeedMultiplier = 1.5,
		ReiatsuMultiplier = 2.5,
		DamageMultiplier = 3.0,
		DefenseMultiplier = 3.0,
		AuraColor = Color3.fromRGB(100, 0, 0),
		Abilities = {
			"AbsorbAbility",   -- copy abilities from devoured Hollows
			"TentacleSwarm",
			"Cero",
			"Bala",
		},
	},
}

-- Returns the Resurreccion data for a given character name
function ResurreccionData.Get(characterName)
	return ResurreccionData.Forms[characterName]
end

-- Returns all Espada sorted by number
function ResurreccionData.GetAllSorted()
	local sorted = {}
	for name, data in pairs(ResurreccionData.Forms) do
		table.insert(sorted, { Name = name, Data = data })
	end
	table.sort(sorted, function(a, b)
		return a.Data.EspadaNumber < b.Data.EspadaNumber
	end)
	return sorted
end

return ResurreccionData
