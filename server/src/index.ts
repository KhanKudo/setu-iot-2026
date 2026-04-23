import { createWebSocketConfig } from "@khankudo/kisdb/server/websocket"
import { createMqttProvider } from "@khankudo/kisdb/server/mqtt"
import { createHttpRoutes } from "@khankudo/kisdb/server/http"
import { CONTROLS, gameIds, handle, PUBLIC } from "./db"
import { cooldown } from "./helpers"

import './game'

PUBLIC.selectGame = async (_, game) => {
  if (
    gameIds.includes(game as any)
    && await PUBLIC.game !== game
  )
    await PUBLIC.game(game as any)
}

CONTROLS.gyro = async (_, [pitch, roll, yaw]) => {
  PUBLIC.gyro({
    roll: roll ?? 0,
    pitch: pitch ?? 0,
    yaw: yaw ?? 0,
  })
}

CONTROLS.accel = async (_, [x, y, z]) => {
  if (z! < -0.8) {
    if (cooldown('z-select', 750)) {
      Promise.all([PUBLIC.game, PUBLIC.gamelist]).then(([game, gamelist]) => {
        if (game === 'gyro' || game === 'accel')
          return // ignore for these two, there the middle button can be used instead

        const nextIndex = gamelist.indexOf(game) + 1 // if game not in list, defaults to zero-index
        PUBLIC.game(gamelist[nextIndex % gamelist.length]!)
      })
    }
  }
  PUBLIC.accel({
    x: x ?? 0,
    y: y ?? 0,
    z: z ?? 0,
  })
}

const conns: number[] = []
const wsconf = createWebSocketConfig(handle, undefined, (ok, conn) => {
  if (ok)
    conns.push(conn)
  else
    conns.splice(conns.indexOf(conn), 1)

  PUBLIC.connections(conns)
})
const httpconf = createHttpRoutes(handle, undefined, (ok, conn) => {
  if (ok)
    conns.push(conn)
  else
    conns.splice(conns.indexOf(conn), 1)

  PUBLIC.connections(conns)
})
createMqttProvider(handle, 'mqtts://broker.emqx.io:8883', 'setu/kisdb/', (ok, conn) => {
  if (ok)
    conns.push(conn)
  else
    conns.splice(conns.indexOf(conn), 1)

  PUBLIC.connections(conns)
})
const server = Bun.serve({
  routes: { ...httpconf, ...wsconf.routes },
  websocket: wsconf.websocket,
  hostname: '0.0.0.0',
  fetch(req, server) {
    let path = URL.parse(req.url)?.pathname?.slice(1) || 'index.html'
    if (path.includes('..'))
      return new Response('BAD PATH', { status: 400 })

    if (path && !path.includes('.'))
      path += '.html'
    return new Response(Bun.file('../../static/' + path))
  }
})
console.log('Ready! ( http://localhost:3000 )')

process.on('exit', () => {
  server.stop(true)
  console.log('server stopped')
})