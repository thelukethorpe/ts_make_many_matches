export class GameLobbyState {
    private readonly gameIdToState: GameIdToState = {}

    constructor(private readonly callbacks: LobbyStateCallbacks) { }

    update(payload: UpdatePayload): void {
        this.updateInternal(payload)
        this.callbacks.onUpdate(payload)
    }

    private updateInternal({ gameId, lobbyId, ccu }: UpdatePayload): void {
        const gameState = this.gameIdToState[gameId]
        if (gameState === undefined) {
            this.createFirstLobbyForNewGame(gameId, lobbyId, ccu)
            return
        }

        const lobbyState = gameState.lobbyIdToState[lobbyId]
        if (lobbyState === undefined) {
            this.createNewLobbyForExistingGame(gameState, lobbyId, ccu)
            return
        }

        if (ccu <= 0) {
            this.deleteLobby(gameId, gameState, lobbyId, lobbyState)
            return
        }

        gameState.ccu += ccu - lobbyState.ccu
        lobbyState.ccu = ccu
    }

    private createFirstLobbyForNewGame(gameId: GameId, lobbyId: LobbyId, ccu: CCU): void {
        if (ccu <= 0) {
            return
        }

        this.gameIdToState[gameId] = {
            ccu,
            lobbyIdToState: {
                [lobbyId]: { ccu }
            }
        }
    }

    private createNewLobbyForExistingGame(gameState: GameState, lobbyId: LobbyId, ccu: CCU): void {
        if (ccu <= 0) {
            return
        }

        gameState.ccu += ccu
        gameState.lobbyIdToState[lobbyId] = {
            ccu,
        }
    }

    private deleteLobby(gameId: GameId, gameState: GameState, lobbyId: LobbyId, lobbyState: LobbyState): void {
        gameState.ccu -= lobbyState.ccu
        delete gameState.lobbyIdToState[lobbyId]
        if (this.doesGameHaveLobbies(gameState)) {
            delete this.gameIdToState[gameId]
        }
    }

    private doesGameHaveLobbies(gameState: GameState): boolean {
        for (const lobbyId in gameState.lobbyIdToState) {
            return true
        }
        return false
    }
}

type LobbyStateCallbacks = Readonly<{
    onUpdate(payload: UpdatePayload): void
}>
type UpdatePayload = Readonly<{
    gameId: GameId
    lobbyId: LobbyId
    ccu: CCU
}>

type GameIdToState = Record<GameId, GameState>
type GameState = {
    ccu: CCU
    lobbyIdToState: Record<LobbyId, LobbyState>
}
type LobbyState = {
    ccu: CCU
}

type GameId = string
type LobbyId = string
type CCU = number
