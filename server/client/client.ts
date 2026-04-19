import { createVanillaViewer } from "@khankudo/kisdb/viewer/vanilla"
import type { Controls, Public } from "../index"
import { addAccount, client, login, selectUser } from "./connection"

const { matrix: MATRIX } = createVanillaViewer<Public>(client, 'public')
const PLAYER = createVanillaViewer<Controls>(client, 'controls')

const ctx2d = (document.getElementById('matrix') as HTMLCanvasElement).getContext('2d')!

MATRIX.$onnow = (matrix) => {
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
      PLAYER.up()
      break
    case 'ArrowDown':
      //@ts-expect-error
      PLAYER.down()
      break
    case 'ArrowLeft':
      //@ts-expect-error
      PLAYER.left()
      break
    case 'ArrowRight':
      //@ts-expect-error
      PLAYER.right()
      break
    case 'Enter':
      //@ts-expect-error
      PLAYER.middle()
      break
    case '0':
      selectUser('anonymous')
      break
    case '1':
    case '2':
    case '3':
      selectUser('web-' + key)
      break
  }
})

addAccount('anonymous', '')
login('web-1', '123')
login('web-2', '456')
login('web-3', '789')