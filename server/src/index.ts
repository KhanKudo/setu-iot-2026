import { createWebSocketConfig } from "@khankudo/kisdb/server/websocket"
import { handle } from "./db"

import './game'

const wsconf = createWebSocketConfig(handle)
const server = Bun.serve({
  ...wsconf,
  hostname: '0.0.0.0',
  fetch(req, server) {
    return new Response(Bun.file('../../static/' + (URL.parse(req.url)?.pathname?.slice(1) || 'index.html')))
  }
})
console.log('Ready! ( http://localhost:3000 )')

process.on('exit', () => {
  server.stop(true)
  console.log('server stopped')
})