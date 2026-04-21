import { createWebSocketConfig } from "@khankudo/kisdb/server/websocket"
import { CONTROLS, gameIds, handle, PUBLIC } from "./db"

import './game'

const conns: number[] = []
const wsconf = createWebSocketConfig(handle, undefined, (ok, conn) => {
  if (ok)
    conns.push(conn)
  else
    conns.splice(conns.indexOf(conn), 1)

  PUBLIC.connections(conns)
})
const server = Bun.serve({
  ...wsconf,
  hostname: '0.0.0.0',
  fetch(req, server) {
    return new Response(Bun.file('../../static/' + (URL.parse(req.url)?.pathname?.slice(1) || 'index.html')))
  }
})
console.log('Ready! ( http://localhost:3000 )')

PUBLIC.selectGame = async (_, game) => {
  if (
    gameIds.includes(game as any)
    && await PUBLIC.game !== game
  )
    await PUBLIC.game(game as any)
}

CONTROLS.gyro = async (_, [pitch, roll, yaw]) => {
  console.log('gyro:', pitch, roll, yaw)
  PUBLIC.gyro({
    roll: roll ?? 0,
    pitch: pitch ?? 0,
    yaw: yaw ?? 0,
  })
}

CONTROLS.accel = async (_, [x, y, z]) => {
  console.log('accel:', x, y, z)
  PUBLIC.accel({
    x: x ?? 0,
    y: y ?? 0,
    z: z ?? 0,
  })
}

process.on('exit', () => {
  server.stop(true)
  console.log('server stopped')
})