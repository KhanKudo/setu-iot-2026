import type { DataType } from "@khankudo/kisdb"
import { createDirectClient } from "@khankudo/kisdb/client/direct"
import { createAdminHelper } from "@khankudo/kisdb/core/admin"
import { EVERYONE, USERS } from "@khankudo/kisdb/core/auth"
import { ensureData } from "@khankudo/kisdb/core/management"
import { createSQLiteHandle, destroySQLiteHandle } from "@khankudo/kisdb/db/sqlite"
import { createVanillaViewer } from "@khankudo/kisdb/viewer/vanilla"

export const gameIds = ['demo', 'pong', 'snake', 'gyro', 'accel'] as const
export type GameId = typeof gameIds[number]

export type KisDB = {
  public: {
    matrix: string
    game: GameId
    gyro: {
      pitch: number
      roll: number
      yaw: number
    }
    accel: {
      x: number
      y: number
      z: number
    }
    connections: number[]
    gamelist: GameId[]
    selectGame(game: string): void
  }
  controls: {
    up(state?: boolean): void
    down(state?: boolean): void
    left(state?: boolean): void
    right(state?: boolean): void
    middle(state?: boolean): void
    gyro([pitch, roll, yaw]: number[]): void
    accel([x, y, z]: number[]): void
  }
  private: {
    gamedata: Partial<Record<GameId, DataType | undefined>>
  }
}

export const handle = await createSQLiteHandle<KisDB>('../../sqlite')

const admin = await createAdminHelper(handle, 'DEFAULT_PA$$WORD')
const RASPI = await admin.ensureUser('raspi', null, true, '94de889064a147c3a960d289356858dc6a384b2a90c04f078a47bd87ddef7137')
const WEB1 = await admin.ensureUser('web-1', '123', true)
const WEB2 = await admin.ensureUser('web-2', '456', true)
const WEB3 = await admin.ensureUser('web-3', '789', true)
const SERVER = await admin.ensureUser('server', false, false, '33a7930d8e894b939d74532d546ef40dfd075f8cf9134f98b1180e6e6bb32165')
await admin.ensureAccess('public', SERVER, EVERYONE, false, USERS)
await admin.ensureAccess('controls', SERVER, false, false, USERS)
await admin.ensureAccess('private', SERVER, false, false, false)
await admin.destroy()

const direct = createDirectClient(handle, { connection: 0, token: '33a7930d8e894b939d74532d546ef40dfd075f8cf9134f98b1180e6e6bb32165' })
await ensureData(direct, 'public', {
  matrix: '000000000PPPPPP00P0000P00P0PP0P00P0PP0P00P0000P00PPPPPP000000000',
  game: 'demo',
  gamelist: [],
  gyro: {
    pitch: 0,
    roll: 0,
    yaw: 0,
  },
  accel: {
    x: 0,
    y: 0,
    z: 0,
  },
  connections: [],
}, false, false)
await ensureData(direct, 'private', {
  gamedata: {}
}, false, false)

export const PUBLIC = createVanillaViewer(direct, 'public')
export const CONTROLS = createVanillaViewer(direct, 'controls')
export const PRIVATE = createVanillaViewer(direct, 'private')

await PUBLIC.gamelist(gameIds as any)

process.on('exit', () => {
  destroySQLiteHandle(handle)
})