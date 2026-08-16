import type { DeepReadonly } from "ts-essentials"

export class GameLobbyState {
    private readonly gameIdToState: GameIdToState = {}
    private readonly updateListenerIdToCallback: Record<UpdateListenerId, OnUpdateCallback> = {}
    private nextUpdateListenerId: UpdateListenerId = 0

    view(): DeepReadonly<GameIdToState> {
        return this.gameIdToState
    }

    update(payload: UpdatePayload): void {
        this.updateInternal(payload)
        this.notifyUpdateListeners(payload)
    }

    registerUpdateListener(onUpdateCallback: OnUpdateCallback): UpdateListenerId {
        const updateListenerId = this.nextUpdateListenerId++
        this.updateListenerIdToCallback[updateListenerId] = onUpdateCallback
        return updateListenerId
    }

    unregisterUpdateListener(updateListenerId: UpdateListenerId): void {
        delete this.updateListenerIdToCallback[updateListenerId]
    }

    private notifyUpdateListeners(payload: UpdatePayload): void {
        const payloadBuffer = JSON.stringify(payload)
        for (const updateListenerId in this.updateListenerIdToCallback) {
            const onUpdateCallback = this.updateListenerIdToCallback[updateListenerId]!
            try {
                onUpdateCallback(payloadBuffer)
            } catch (e) {
                console.error(`Error notifying listener ${updateListenerId} of update:`, e)
            }
        }
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

type UpdatePayload = Readonly<{
    gameId: GameId
    lobbyId: LobbyId
    ccu: CCU
}>
type OnUpdateCallback = (payloadBuffer: string) => void
type UpdateListenerId = number

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
