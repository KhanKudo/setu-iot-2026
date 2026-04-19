import { createSQLiteHandle, destroySQLiteHandle } from "@khankudo/kisdb/db/sqlite"
import { createWebSocketConfig } from "@khankudo/kisdb/server/websocket"
import { createDirectClient } from "@khankudo/kisdb/client/direct"
import { createVanillaViewer, refUpdater } from "@khankudo/kisdb/viewer/vanilla"
import type { KCPTrustedContext } from "@khankudo/kisdb"
import { createAdminHelper } from "@khankudo/kisdb/core/admin"
import { EVERYONE, USERS } from "@khankudo/kisdb/core/auth"
import { ensureData } from "@khankudo/kisdb/core/management"

const handle = await createSQLiteHandle('../sqlite')

const admin = await createAdminHelper(handle, 'DEFAULT_PA$$WORD')
const RASPI = await admin.ensureUser('raspi', null, true, '94de889064a147c3a960d289356858dc6a384b2a90c04f078a47bd87ddef7137')
const WEB1 = await admin.ensureUser('web-1', '123', true)
const WEB2 = await admin.ensureUser('web-2', '456', true)
const WEB3 = await admin.ensureUser('web-3', '789', true)
const SERVER = await admin.ensureUser('server', false, false, '33a7930d8e894b939d74532d546ef40dfd075f8cf9134f98b1180e6e6bb32165')
await admin.ensureAccess('public', SERVER, EVERYONE, false, false)
await admin.ensureAccess('controls', SERVER, false, false, USERS)
await admin.ensureAccess('private', SERVER, false, false, false)
await admin.destroy()

export type Public = {
  matrix: string
}

export type Controls = {
  up(ctx: KCPTrustedContext): void
  down(ctx: KCPTrustedContext): void
  left(ctx: KCPTrustedContext): void
  right(ctx: KCPTrustedContext): void
  middle(ctx: KCPTrustedContext): void
}

export type Private = {
  players: Record<number, {
    position: { x: number, y: number },
    color: number,
  }>
}

const direct = createDirectClient(handle, { connection: 0, token: '33a7930d8e894b939d74532d546ef40dfd075f8cf9134f98b1180e6e6bb32165' })
await ensureData(direct, 'public', <Public>{
  matrix: '000000000PPPPPP00P0000P00P0PP0P00P0PP0P00P0000P00PPPPPP000000000',
}, false, false)
await ensureData(direct, 'private', <Private>{
  players: {}
}, false, false)

const { matrix: MATRIX } = createVanillaViewer<Public>(direct, 'public')
const CONTROLS = createVanillaViewer<Controls>(direct, 'controls')
const { players: PLAYERS } = createVanillaViewer<Private>(direct, 'private')

function toMatrix(grid: number[]): string {
  return grid.reduce((str, x) => str + String.fromCharCode(48 + ((Math.floor(x / 0o100) << 4) | (Math.floor((x % 0o100) / 0o10) << 2) | (x % 0o10))), '')
}

const localPlayers = await PLAYERS
PLAYERS.$onnow = ps => {
  Object.assign(localPlayers, ps)
  for (const p in localPlayers) {
    if (p in ps)
      continue
    delete localPlayers[p]
  }
}

function randi(max: number = 1, min: number = 0): number {
  return Math.round(Math.random() * (max - min)) + min
}

function getPlayer(id: number): Private['players'][0] {
  const exists = id in localPlayers

  if (exists) {
    return localPlayers[id]!
  }
  else {
    localPlayers[id] = {
      position: { x: randi(7), y: randi(7) },
      color: (randi(3) << 6) | (randi(3) << 3) | randi(3),
    }
    PLAYERS[id]?.(localPlayers[id])
    return localPlayers[id]
  }
}

CONTROLS.up = async ({ identity }) => {
  const { position: { x, y } } = getPlayer(identity)
  PLAYERS[identity]?.position.y((y + 1) % 8)
}
CONTROLS.down = async ({ identity }) => {
  const { position: { x, y } } = getPlayer(identity)
  PLAYERS[identity]?.position.y((y + 8 - 1) % 8)
}
CONTROLS.right = async ({ identity }) => {
  const { position: { x, y } } = getPlayer(identity)
  PLAYERS[identity]?.position.x((x + 1) % 8)
}
CONTROLS.left = async ({ identity }) => {
  const { position: { x, y } } = getPlayer(identity)
  PLAYERS[identity]?.position.x((x + 8 - 1) % 8)
}
CONTROLS.middle = async ({ identity }) => {
  const { color } = getPlayer(identity)
  switch (color) {
    case 0o000:
      PLAYERS[identity]?.color(0o333)
      break
    case 0o333:
      PLAYERS[identity]?.color(0o300)
      break
    default:
      PLAYERS[identity]?.color(color >> 3)
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

  MATRIX(toMatrix(grid))
}, PLAYERS)

const wsconf = createWebSocketConfig(handle)
const server = Bun.serve({
  ...wsconf,
  hostname: '0.0.0.0',
  fetch(req, server) {
    return new Response(Bun.file('../static/' + (URL.parse(req.url)?.pathname?.slice(1) || 'index.html')))
  }
})
console.log('Ready! ( http://localhost:3000 )')

process.on('exit', () => {
  server.stop(true)
  destroySQLiteHandle(handle)
})