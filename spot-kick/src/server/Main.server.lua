-- Server entry point. Builds the arena and starts every service in order.

local Workspace = game:GetService("Workspace")

local Server = script.Parent
local ArenaBuilder = require(Server.ArenaBuilder)
local DataService = require(Server.DataService)
local MonetizationService = require(Server.MonetizationService)
local LeaderboardService = require(Server.LeaderboardService)
local GameService = require(Server.GameService)
local ShopService = require(Server.ShopService)
local DuelService = require(Server.DuelService)

local arena, pitches = ArenaBuilder.build()

MonetizationService.start()
LeaderboardService.start(arena.Lobby.Leaderboard)
GameService.start(pitches)
ShopService.start()
DuelService.start()
DataService.start() -- last, so every listener is connected before profiles load

Workspace:SetAttribute("Ready", true)
