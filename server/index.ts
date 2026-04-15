import { bindContext } from "@khankudo/kisdb"
import { createSQLiteHandle, destroySQLiteHandle } from "@khankudo/kisdb/db/sqlite"
import { createWebSocketConfig } from "@khankudo/kisdb/server/websocket"
import { createVanillaViewer, refUpdater } from "@khankudo/kisdb/viewer/vanilla"

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
  stick: Record<'up' | 'down' | 'left' | 'right' | 'middle', boolean>,
  matrix: string,
  position: { x: number, y: number },
  color: number,
}

const DB = createVanillaViewer<ionowType>(bindContext({ connection: 0, token: Bun.env.SERVER_TOKEN ?? '' }, handle))

if (await DB.color === undefined) {
  await DB({
    stick: {
      'up': false,
      'down': false,
      'left': false,
      'right': false,
      'middle': false,
    },
    matrix: '0'.repeat(64),
    color: 0,
    position: {
      x: 0,
      y: 0,
    },
  })
}

function toMatrix(grid: number[]): string {
  return grid.reduce((str, x) => str + String.fromCharCode(48 + ((Math.floor(x / 0o100) << 4) | (Math.floor((x % 0o100) / 0o10) << 2) | (x % 0o10))), '')
}

refUpdater((pos, col) => {
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

  //@ts-ignore
  const index: number = pos.x + (7 - pos.y) * 8
  //@ts-ignore
  grid[index] = col

  DB.matrix(toMatrix(grid))
}, DB.position, DB.color)

DB.position.$on = p => pos = p
let pos = await DB.position
if (!pos)
  DB.position({ x: 3, y: 3 })
DB.color.$on = c => col = c
let col = await DB.color
if (typeof col !== 'number')
  DB.color(0o300)

DB.stick.up.$on = (state) => {
  if (state)
    DB.position.y((pos.y + 1) % 8)
}
DB.stick.down.$on = (state) => {
  if (state)
    DB.position.y((pos.y + 8 - 1) % 8)
}
DB.stick.right.$on = (state) => {
  if (state)
    DB.position.x((pos.x + 1) % 8)
}
DB.stick.left.$on = (state) => {
  if (state)
    DB.position.x((pos.x + 8 - 1) % 8)
}
DB.stick.middle.$on = (state) => {
  if (state) {
    if (col === 0)
      col = 0o333
    else if (col === 0o333)
      col = 0o300
    else
      col = col >> 3

    DB.color(col)
  }
}

process.on('exit', () => {
  server.stop(true)
  destroySQLiteHandle(handle)
})