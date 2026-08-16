import { GameLobbyState } from "./game-lobby-state.js"
import crypto from 'crypto'
import Fastify from "fastify";
import { Type } from "@sinclair/typebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import websocket from "@fastify/websocket";
import { WebSocket } from "@fastify/websocket";

const fastify = Fastify().withTypeProvider<TypeBoxTypeProvider>();

// TODO extract into some sort of app class that generalises fastify out so we can use in-memory equivalents for testing
export async function runMatchStateShardApp(streamPassword: string, updatePassword: string): Promise<void> {
  const gameLobbyState = new GameLobbyState()
  await setupStreamRouting(gameLobbyState, streamPassword)
  setupUpdateRouting(gameLobbyState, updatePassword)
  await listen()
}

async function setupStreamRouting(gameLobbyState: GameLobbyState, password: string): Promise<void> {
  await fastify.register(websocket)

  const streamSchema = {
    body: Type.Object({
      password: Type.String(),
    })
  }
  fastify.get("/stream", { schema: streamSchema, websocket: true }, (socket: WebSocket, request) => {
    if (!timingSafeEqual(password, request.body.password)) {
      return socket.close(401)
    }

    const view = gameLobbyState.view()
    socket.send(JSON.stringify(view))

    const listenerId = gameLobbyState.registerUpdateListener((payloadBuffer) => {
      socket.send(payloadBuffer)
    })
    socket.on("close", () => {
      gameLobbyState.unregisterUpdateListener(listenerId)
    })
  })
}

function setupUpdateRouting(gameLobbyState: GameLobbyState, password: string): void {
  const updateSchema = {
    body: Type.Object({
      password: Type.String(),
      gameId: Type.String(),
      lobbyId: Type.String(),
      ccu: Type.Integer({
        minimum: 0,
      }),
    })
  }
  fastify.post('/update', { schema: updateSchema }, async (request, reply) => {
    if (!timingSafeEqual(password, request.body.password)) {
      return reply.code(401)
    }
    gameLobbyState.update(request.body)
    return reply.code(200)
  })
}

function timingSafeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  )
}

async function listen(): Promise<void> {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
