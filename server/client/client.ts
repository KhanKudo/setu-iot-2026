import { createVanillaViewer } from "@khankudo/kisdb/viewer/vanilla"
import { createWebSocketClient } from "@khankudo/kisdb/client/websocket"
import type { ionowType } from "../index"

if (!sessionStorage.getItem('token'))
  sessionStorage.setItem('token', window.prompt('Please enter a token:') ?? '')

const ctx = { token: sessionStorage.getItem('token') ?? '' }
const client = createWebSocketClient(undefined, ctx)
const DB = createVanillaViewer<ionowType & { speedtest: number }>(client)

const ctx2d = (document.getElementById('matrix') as HTMLCanvasElement).getContext('2d')!

DB.stick.$onnow = (state) => {
  console.log('stick:', state)
  for (const k in state) {
    document.getElementById('stick-' + k)!.style.color = (state as any)[k] ? 'red' : ''
  }
}

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
      DB.stick.up(true)
      break
    case 'ArrowDown':
      DB.stick.down(true)
      break
    case 'ArrowLeft':
      DB.stick.left(true)
      break
    case 'ArrowRight':
      DB.stick.right(true)
      break
    case 'Enter':
      DB.stick.middle(true)
      break
  }
})


window.addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'ArrowUp':
      DB.stick.up(false)
      break
    case 'ArrowDown':
      DB.stick.down(false)
      break
    case 'ArrowLeft':
      DB.stick.left(false)
      break
    case 'ArrowRight':
      DB.stick.right(false)
      break
    case 'Enter':
      DB.stick.middle(false)
      break
  }
})