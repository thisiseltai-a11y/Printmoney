-- Cosmetic catalog. All names, kits and logos are original; there are no real
-- clubs, players or brands here, so add new items the same way.
--
-- Unlock is one of:
--   { Coins = n }        buy with coins
--   { Rebirths = n }     free once you reach n rebirths (exclusive)
--   { GamePass = key }   owned with the named gamepass (see Config.GamePasses)
--   { Default = true }   everyone owns it
--   { Event = id }       limited/event item, granted by the server
--
-- Colors are {r, g, b} in 0-255.

local Cosmetics = {}

Cosmetics.Categories = { "Ball", "Kit", "Trail", "Celebration" }

Cosmetics.Items = {
	Ball = {
		{ Id = "Classic", Name = "Classic", Color = { 245, 245, 245 }, Material = "SmoothPlastic", Unlock = { Default = true } },
		{ Id = "Sunburst", Name = "Sunburst", Color = { 255, 196, 40 }, Material = "SmoothPlastic", Unlock = { Coins = 2000 } },
		{ Id = "Volt", Name = "Volt", Color = { 120, 255, 90 }, Material = "Neon", Unlock = { Coins = 9000 } },
		{ Id = "Obsidian", Name = "Obsidian", Color = { 30, 30, 36 }, Material = "Glass", Unlock = { Coins = 30000 } },
		{ Id = "Phoenix", Name = "Phoenix", Color = { 255, 90, 30 }, Material = "Neon", Unlock = { Rebirths = 1 } },
		{ Id = "Frostbite", Name = "Frostbite", Color = { 170, 230, 255 }, Material = "Ice", Unlock = { Event = "Winter" } },
	},
	Kit = {
		{ Id = "Home", Name = "Harbor Gulls (Home)", Color = { 230, 230, 235 }, Accent = { 30, 60, 140 }, Unlock = { Default = true } },
		{ Id = "Away", Name = "Harbor Gulls (Away)", Color = { 30, 60, 140 }, Accent = { 240, 200, 60 }, Unlock = { Coins = 1500 } },
		{ Id = "Comets", Name = "Ridgeway Comets", Color = { 200, 40, 50 }, Accent = { 255, 255, 255 }, Unlock = { Coins = 6000 } },
		{ Id = "Owls", Name = "Mossbank Owls", Color = { 40, 110, 60 }, Accent = { 230, 210, 150 }, Unlock = { Coins = 20000 } },
		{ Id = "Royals", Name = "Velvet Royals", Color = { 90, 40, 140 }, Accent = { 250, 210, 80 }, Unlock = { Rebirths = 3 } },
	},
	Trail = {
		{ Id = "None", Name = "None", Unlock = { Default = true } },
		{ Id = "Chalk", Name = "Chalk Line", Color = { 255, 255, 255 }, Color2 = { 200, 200, 200 }, Unlock = { Coins = 3000 } },
		{ Id = "Ember", Name = "Ember", Color = { 255, 140, 30 }, Color2 = { 255, 40, 20 }, Unlock = { Coins = 12000 } },
		{ Id = "Aurora", Name = "Aurora", Color = { 80, 255, 200 }, Color2 = { 160, 80, 255 }, Unlock = { Rebirths = 2 } },
		{ Id = "VIP", Name = "VIP Gold", Color = { 255, 215, 80 }, Color2 = { 255, 255, 200 }, Unlock = { GamePass = "VipTrail" } },
	},
	Celebration = {
		{ Id = "Confetti", Name = "Confetti", Unlock = { Default = true } },
		{ Id = "Fireworks", Name = "Fireworks", Unlock = { Coins = 5000 } },
		{ Id = "CoinRain", Name = "Coin Rain", Unlock = { Coins = 25000 } },
		{ Id = "Lightning", Name = "Lightning", Unlock = { Rebirths = 5 } },
	},
}

function Cosmetics.get(category, id)
	local list = Cosmetics.Items[category]
	if not list then
		return nil
	end
	for _, item in ipairs(list) do
		if item.Id == id then
			return item
		end
	end
	return nil
end

function Cosmetics.default(category)
	for _, item in ipairs(Cosmetics.Items[category]) do
		if item.Unlock.Default then
			return item.Id
		end
	end
	return nil
end

-- Does this profile currently have access to the item?
-- `passes` is a set of owned gamepass keys.
function Cosmetics.isOwned(profile, passes, category, id)
	local item = Cosmetics.get(category, id)
	if not item then
		return false
	end
	local u = item.Unlock
	if u.Default then
		return true
	end
	if u.Rebirths then
		return (profile.rebirths or 0) >= u.Rebirths
	end
	if u.GamePass then
		return passes ~= nil and passes[u.GamePass] == true
	end
	local owned = profile.owned and profile.owned[category]
	return owned ~= nil and owned[id] == true
end

return Cosmetics
