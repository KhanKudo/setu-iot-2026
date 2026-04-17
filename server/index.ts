import { createSQLiteHandle, destroySQLiteHandle } from "@khankudo/kisdb/db/sqlite"
import { createWebSocketConfig } from "@khankudo/kisdb/server/websocket"
import { createDirectClient } from "@khankudo/kisdb/client/direct"
import { createVanillaViewer, refUpdater, risingEdge } from "@khankudo/kisdb/viewer/vanilla"

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
const direct = createDirectClient(handle, { connection: 0, token: Bun.env.SERVER_TOKEN ?? '' })
const DB = createVanillaViewer<ionowType>(direct)

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
    color: 0o333,
    position: {
      x: 0,
      y: 0,
    },
  })
}

function toMatrix(grid: number[]): string {
  return grid.reduce((str, x) => str + String.fromCharCode(48 + ((Math.floor(x / 0o100) << 4) | (Math.floor((x % 0o100) / 0o10) << 2) | (x % 0o10))), '')
}

let X = await DB.position.x
DB.position.x.$onnow = x => X = x
let Y = await DB.position.y
DB.position.y.$onnow = y => Y = y
let C = await DB.color
DB.color.$onnow = c => C = c

refUpdater((x, y, col) => {
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

  const index: number = x + (7 - y) * 8
  grid[index] = col

  DB.matrix(toMatrix(grid))
}, DB.position.x, DB.position.y, DB.color)

DB.stick.up.$onnow = risingEdge(() => DB.position.y((Y + 1) % 8))
DB.stick.down.$onnow = risingEdge(() => DB.position.y((Y + 8 - 1) % 8))
DB.stick.right.$onnow = risingEdge(() => DB.position.x((X + 1) % 8))
DB.stick.left.$onnow = risingEdge(() => DB.position.x((X + 8 - 1) % 8))
DB.stick.middle.$onnow = risingEdge(() => {
  switch (C) {
    case 0o000:
      DB.color(0o333)
      break
    case 0o333:
      DB.color(0o300)
      break
    default:
      DB.color(C >> 3)
      break
  }
})

process.on('exit', () => {
  server.stop(true)
  destroySQLiteHandle(handle)
})