import type { DataType, KCPTrustedContext } from "@khankudo/kisdb"
import { createDirectClient } from "@khankudo/kisdb/client/direct"
import { createAdminHelper } from "@khankudo/kisdb/core/admin"
import { EVERYONE, USERS } from "@khankudo/kisdb/core/auth"
import { ensureData } from "@khankudo/kisdb/core/management"
import { createSQLiteHandle, destroySQLiteHandle } from "@khankudo/kisdb/db/sqlite"
import { createVanillaViewer } from "@khankudo/kisdb/viewer/vanilla"

export type GameId = 'demo' | 'pong'

export type Database = {
  public: {
    matrix: string
    game: GameId
  }
  controls: {
    up(ctx: KCPTrustedContext, state?: boolean): void
    down(ctx: KCPTrustedContext, state?: boolean): void
    left(ctx: KCPTrustedContext, state?: boolean): void
    right(ctx: KCPTrustedContext, state?: boolean): void
    middle(ctx: KCPTrustedContext, state?: boolean): void
  }
  private: {
    gamedata: Partial<Record<GameId, DataType | undefined>>
  }
}

export const handle = await createSQLiteHandle<Database>('../../sqlite')

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

const direct = createDirectClient(handle, { connection: 0, token: '33a7930d8e894b939d74532d546ef40dfd075f8cf9134f98b1180e6e6bb32165' })
await ensureData(direct, 'public', {
  matrix: '000000000PPPPPP00P0000P00P0PP0P00P0PP0P00P0000P00PPPPPP000000000',
  game: 'demo',
}, false, false)
await ensureData(direct, 'private', {
  gamedata: {}
}, false, false)

export const PUBLIC = createVanillaViewer(direct, 'public')
export const CONTROLS = createVanillaViewer(direct, 'controls')
export const PRIVATE = createVanillaViewer(direct, 'private')

process.on('exit', () => {
  destroySQLiteHandle(handle)
})