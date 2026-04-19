import { createVanillaViewer } from "@khankudo/kisdb/viewer/vanilla"
import { addAccount, client, isConnected, login, selectUser } from "./connection"

const { matrix: MATRIX, game: GAME } = createVanillaViewer(client, 'public')
const PLAYER = createVanillaViewer(client, 'controls')

const ctx2d = (document.getElementById('matrix') as HTMLCanvasElement).getContext('2d')!

GAME.$onnow = name => {
  const title = document.getElementById('title')
  if (title)
    title.innerText = name
}

function render(matrix: string) {
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
MATRIX.$onnow = render
//splashscreen
render("8888888888888888800880088008800888800888880000888800008888088088")
isConnected(ok => {
  if (!ok)
    render("8888888888888888800880088008800888800888880000888800008888088088")
})

window.addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'ArrowUp':
      //@ts-expect-error
      PLAYER.up(true)
      break
    case 'ArrowDown':
      //@ts-expect-error
      PLAYER.down(true)
      break
    case 'ArrowLeft':
      //@ts-expect-error
      PLAYER.left(true)
      break
    case 'ArrowRight':
      //@ts-expect-error
      PLAYER.right(true)
      break
    case 'Enter':
      //@ts-expect-error
      PLAYER.middle(true)
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

window.addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'ArrowUp':
      //@ts-expect-error
      PLAYER.up(false)
      break
    case 'ArrowDown':
      //@ts-expect-error
      PLAYER.down(false)
      break
    case 'ArrowLeft':
      //@ts-expect-error
      PLAYER.left(false)
      break
    case 'ArrowRight':
      //@ts-expect-error
      PLAYER.right(false)
      break
    case 'Enter':
      //@ts-expect-error
      PLAYER.middle(false)
      break
  }
})

addAccount('anonymous', '')
login('web-1', '123')
login('web-2', '456')
login('web-3', '789')