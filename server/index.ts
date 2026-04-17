import { createSQLiteHandle, destroySQLiteHandle } from "@khankudo/kisdb/db/sqlite"
import { createWebSocketConfig } from "@khankudo/kisdb/server/websocket"
import { createDirectClient } from "@khankudo/kisdb/client/direct"
import { createVanillaViewer, refUpdater, risingEdge } from "@khankudo/kisdb/viewer/vanilla"
import type { KCPTrustedContext } from "@khankudo/kisdb"

const handle = await createSQLiteHandle('../sqlite')

const wsconf = createWebSocketConfig(handle)

const server = Bun.serve({
  ...wsconf,
  hostname: '0.0.0.0',
  fetch(req, server) {
    return new Response(Bun.file('../static/' + (URL.parse(req.url)?.pathname?.slice(1) || 'index.html')))
  }
})

console.log('Ready! ( http://localhost:3000 )')

export type ionowType = {
  matrix: string,
  players: Record<number, {
    position: { x: number, y: number },
    color: number,
  }>
  controls: {
    up(ctx: KCPTrustedContext): void
    down(ctx: KCPTrustedContext): void
    left(ctx: KCPTrustedContext): void
    right(ctx: KCPTrustedContext): void
    middle(ctx: KCPTrustedContext): void
  }
}
const direct = createDirectClient(handle, { connection: 0, token: Bun.env.SERVER_TOKEN ?? '' })
const DB = createVanillaViewer<ionowType>(direct)

const tst = await DB.players
console.log('tst:', tst)
if (tst === undefined) {
  await DB.matrix('0'.repeat(64))
  await DB.players({})
  console.log('players reset!')
}

function toMatrix(grid: number[]): string {
  return grid.reduce((str, x) => str + String.fromCharCode(48 + ((Math.floor(x / 0o100) << 4) | (Math.floor((x % 0o100) / 0o10) << 2) | (x % 0o10))), '')
}

const players = await DB.players ?? {} // TEMPORARY, TODO: fix cause of issue with empty object setting and listening
console.log('players:', players)
DB.players.$onnow = ps => {
  console.log('ps:', ps)
  if (!ps)
    return
  Object.assign(players, ps)
  for (const p in players) {
    if (p in ps)
      continue
    delete players[p]
  }
}

function randi(max: number = 1, min: number = 0): number {
  return Math.round(Math.random() * (max - min)) + min
}

function getPlayer(id: number): ionowType['players'][0] {
  const res = players[id] ??= {
    position: { x: randi(7), y: randi(7) },
    color: (randi(3) << 6) | (randi(3) << 3) | randi(3),
  }

  console.log('get player:', res)

  DB.players[id]?.(res)

  return res
}

DB.controls.up = async ({ identity }) => {
  const { position: { x, y } } = getPlayer(identity)
  DB.players[identity]?.position.y((y + 1) % 8)
}
DB.controls.down = async ({ identity }) => {
  const { position: { x, y } } = getPlayer(identity)
  DB.players[identity]?.position.y((y + 8 - 1) % 8)
}
DB.controls.right = async ({ identity }) => {
  const { position: { x, y } } = getPlayer(identity)
  DB.players[identity]?.position.x((x + 1) % 8)
}
DB.controls.left = async ({ identity }) => {
  const { position: { x, y } } = getPlayer(identity)
  DB.players[identity]?.position.x((x + 8 - 1) % 8)
}
DB.controls.middle = async ({ identity }) => {
  const { color } = getPlayer(identity)
  switch (color) {
    case 0o000:
      DB.players[identity]?.color(0o333)
      break
    case 0o333:
      DB.players[identity]?.color(0o300)
      break
    default:
      DB.players[identity]?.color(color >> 3)
      break
  }
}

refUpdater((players) => {
  const grid = [
    0o000, 0o002, 0o000, 0o000, 0o000, 0o000, 0o222, 0o000,
    0o002, 0o002, 0o000, 0o000, 0o000, 0o000, 0o222, 0o222,
    0o000, 0o000, 0o000, 0o000, 0o000, 0o000, 0o000, 0o000,
    0o000, 0o000, 0o000, 0o000, 0o000, 0o000, 0o000, 0o000,
    0o000, 0o000, 0o000, 0o000, 0o000, 0o000, 0o000, 0o000,
    0o000, 0o000, 0o000, 0o000, 0o000, 0o000, 0o000, 0o000,
    0o020, 0o020, 0o000, 0o000, 0o000, 0o000, 0o200, 0o200,
    0o000, 0o020, 0o000, 0o000, 0o000, 0o000, 0o200, 0o000,
  ]

  for (const id in players) {
    const { position: { x, y }, color } = players[id]!
    const index: number = x + (7 - y) * 8
    grid[index] = color
  }

  DB.matrix(toMatrix(grid))
}, DB.players)

process.on('exit', () => {
  server.stop(true)
  destroySQLiteHandle(handle)
})