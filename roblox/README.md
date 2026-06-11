# Roblox Bleach Game – Resurreccion System

## File Structure

```
roblox/
├── ReplicatedStorage/
│   └── Modules/
│       ├── ResurreccionData.lua   ← All 9 Espada Resurreccion stats & abilities
│       └── AbilityHandlers.lua    ← Server-side logic for every ability
├── ServerScriptService/
│   ├── GameSetup.server.lua       ← Creates RemoteEvents on startup
│   └── ResurreccionServer.server.lua ← Handles activation, stats, cleanup
└── StarterPlayerScripts/
    └── ResurreccionClient.client.lua ← Input, UI, camera effects
```

## Espada Covered

| # | Espada | Resurreccion | Key Abilities |
|---|--------|-------------|---------------|
| 0 | Yammy | Ira | IraBelch, GargantaMassive |
| 1 | Starrk | Los Lobos | CeroPistola, CeroMetralleta, LosLobosWolves |
| 2 | Barragan | Arrogante | Respira (decay aura), Senescencia (time slow) |
| 3 | Harribel | Tiburon | TijeraShark, TorrienteWave, LaGota |
| 4 | Ulquiorra | Murciélago | CeroOscuras, LanzaDelRelampago, **Segunda Etapa** |
| 5 | Nnoitra | Santa Teresa | SantaTeresaSlash (6-hit), RegenerateArmor |
| 6 | Grimmjow | Pantera | GranzRei, DesgarronClaws, PanteraSpeed |
| 7 | Zommari | Brujería | Amor (control reversal) |
| 8 | Szayelaporro | Fornicarás | GabrielBirth (full heal), ReiatsuDrain |
| 9 | Aaroniero | Glotonería | AbsorbAbility, TentacleSwarm |

## Keybinds

| Key | Action |
|-----|--------|
| G | Release / Seal Resurreccion |
| Z | Ability slot 1 |
| X | Ability slot 2 |
| C | Ability slot 3 |
| V | Ability slot 4 |
| T | Segunda Etapa (Ulquiorra only) |

## Setup in Roblox Studio

1. Copy `ReplicatedStorage/Modules/` into your game's **ReplicatedStorage**.
2. Copy `ServerScriptService/` scripts into **ServerScriptService**.
3. Copy `StarterPlayerScripts/` scripts into **StarterPlayerScripts**.
4. Each player needs a **Profile** folder under their Player object with:
   - `Race` (StringValue) = `"Arrancar"`
   - `EspadaName` (StringValue) = e.g. `"Grimmjow"`
   - `Reiatsu` (NumberValue) = starting Reiatsu amount

## Adding More Arrancars

Add a new entry to `ResurreccionData.Forms` in `ResurreccionData.lua` and add
corresponding handlers in `AbilityHandlers.lua`.
