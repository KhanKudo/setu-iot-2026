import { createVanillaViewer } from "@khankudo/kisdb/viewer/vanilla"
import { addAccount, client, isConnected, login, selectUser } from "./connection"
import type { GameId } from "../src/db"

const { matrix: MATRIX, game: GAME, gamelist: GAMELIST, selectGame: SELECT_GAME, connections: CONNS } = createVanillaViewer(client, 'public')
const PLAYER = createVanillaViewer(client, 'controls')

const ctx2d = (document.getElementById('matrix') as HTMLCanvasElement).getContext('2d')!

let activeGame: GameId | null = null

GAME.$onnow = name => {
  const title = document.getElementById('title')
  if (title)
    title.innerText = name

  if (activeGame)
    document.querySelector('#game-' + activeGame)?.classList.remove('active')

  if (name)
    document.querySelector('#game-' + name)?.classList.add('active')

  activeGame = name
}

GAMELIST.$onnow = (games) => {
  const list = document.getElementById('games')
  if (!list)
    return console.warn('NO GAMES LIST ELEM FOUND')

  list.innerHTML = ''
  for (const game of games) {
    const btn = document.createElement('button')
    btn.id = 'game-' + game
    btn.classList.toggle('active', game === activeGame)
    btn.innerText = game
    btn.onclick = () => {
      SELECT_GAME(game)
    }
    list.appendChild(btn)
  }
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

CONNS.$onnow = conns => {
  const list = document.getElementById('connections')
  if (!list)
    throw new Error('NO CONNECTIONS LIST ELEM')

  list.innerHTML = conns
    .map(c => `<div>${c}</div>`)
    .join('\n')
}

//splashscreen
render("8888888888888888800880088008800888800888880000888800008888088088")
isConnected(ok => {
  if (!ok)
    render("8888888888888888800880088008800888800888880000888800008888088088")
})

window.addEventListener('keydown', ({ key }) => {
  console.log('key:', key)
  switch (key) {
    case 'w':
    case 'W':
    case 'ArrowUp':
      PLAYER.up(true)
      break
    case 's':
    case 'S':
    case 'ArrowDown':
      PLAYER.down(true)
      break
    case 'a':
    case 'A':
    case 'ArrowLeft':
      PLAYER.left(true)
      break
    case 'd':
    case 'D':
    case 'ArrowRight':
      PLAYER.right(true)
      break
    case ' ':
    case '':
    case 'Enter':
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
      PLAYER.up(false)
      break
    case 'ArrowDown':
      PLAYER.down(false)
      break
    case 'ArrowLeft':
      PLAYER.left(false)
      break
    case 'ArrowRight':
      PLAYER.right(false)
      break
    case 'Enter':
      PLAYER.middle(false)
      break
  }
})

addAccount('anonymous', '')
login('web-1', '123')
login('web-2', '456')
login('web-3', '789')