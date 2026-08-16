import { GameLobbyState } from "./game-lobby-state.js"
import crypto from 'crypto'
import Fastify from "fastify";
import { Type } from "@sinclair/typebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

export async function runMatchStateShardApp(password: string): Promise<void> {
  const gameLobbyState = new GameLobbyState({
    onUpdate: (payload): void => {

    }
  })
  await listenForUpdates(gameLobbyState, password)
}

async function listenForUpdates(gameLobbyState: GameLobbyState, password: string): Promise<void> {
  const fastify = Fastify().withTypeProvider<TypeBoxTypeProvider>();

  const updateSchema = {
    body: Type.Object({
      password: Type.String(),
    })
  }
  fastify.post('/update', { schema: updateSchema }, async (request, reply) => {
    if (!timingSafeEqual(password, request.body.password)) {
      return reply.code(401)
    }

    return reply.code(200)
  })

  // Run the server!
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  )
}
