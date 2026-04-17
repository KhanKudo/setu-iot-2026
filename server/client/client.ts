import { createVanillaViewer } from "@khankudo/kisdb/viewer/vanilla"
import { createWebSocketClient } from "@khankudo/kisdb/client/websocket"
import type { ionowType } from "../index"

if (!sessionStorage.getItem('token'))
  sessionStorage.setItem('token', window.prompt('Please enter a token:') ?? '')

const ctx = { token: sessionStorage.getItem('token') ?? '' }
const client = createWebSocketClient(undefined, ctx)
const DB = createVanillaViewer<ionowType & { speedtest: number }>(client)

const ctx2d = (document.getElementById('matrix') as HTMLCanvasElement).getContext('2d')!

DB.matrix.$onnow = (matrix) => {
  const S = 40
  const pixel = (x: number, y_inv: number, col?: number) => {
    if (col !== undefined)
      ctx2d.fillStyle = `rgb(${85 * (col >> 4)},${85 * ((col & 0b00001100) >> 2)},${85 * (col & 0b11)})`
    ctx2d.fillRect(x * S, y_inv * S, S, S)
  }
  for (let i = 0; i < matrix.length; i++) {
    pixel(i % 8, Math.floor(i / 8), matrix.charCodeAt(i) - 48)
  }
}

window.addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'ArrowUp':
      //@ts-expect-error
      DB.controls.up()
      break
    case 'ArrowDown':
      //@ts-expect-error
      DB.controls.down()
      break
    case 'ArrowLeft':
      //@ts-expect-error
      DB.controls.left()
      break
    case 'ArrowRight':
      //@ts-expect-error
      DB.controls.right()
      break
    case 'Enter':
      //@ts-expect-error
      DB.controls.middle()
      break
  }
})