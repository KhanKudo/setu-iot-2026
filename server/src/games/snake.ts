import { type GameHandle } from "../game"
import { after, bot, fps, gameloop, playerSelector, randi, type BotData } from "../helpers"
import { O as _, W, draw, R, G1, G3, G, drawNumber, findPixel, Y, getPixel, M } from "../render"

type XY = { x: number, y: number }

type DIR = 0 | 1 | 2 | 3 // up - right - down - left

function eq(a: XY, b: XY): boolean {
  return a.x === b.x && a.y === b.y
}

const COLOR_APPLE = R
const COLOR_SNAKE_HEAD = G3
const COLOR_SNAKE_BODY = G
const COLOR_SNAKE_TAIL = G1

let GAME_FPS = 2

type Save = {
  highscore: number,
  pbs: Record<number, number>,
}

export default function startGame(handle: GameHandle<Save>): () => void {
  handle.memory ??= { highscore: 0, pbs: {} }
  handle.memory.highscore ??= 0
  handle.memory.pbs ??= {}

  const { grid, memory } = handle

  const snake: XY[] = []
  let index = 2
  const apple: XY = { x: 0, y: 0 }

  function snek(bodyIndex: number): XY
  function snek(bodyIndex: number, value: XY): void
  function snek(bodyIndex: number, value?: XY): XY | void {
    const si = (index + snake.length - bodyIndex) % snake.length
    if (value)
      snake[si] = value
    else
      return snake[si]
  }

  // 0 if snake died
  // 1 if snake moved to valid
  // 2 if snake ate an apple
  function move(dir?: DIR): 0 | 1 | 2 {
    const head: XY = { ...snek(0) }
    switch (dir) {
      case 0:
        head.y++
        break
      case 1:
        head.x++
        break
      case 2:
        head.y--
        break
      case 3:
        head.x--
        break
      default:
        break
    }
    // don't allow snake to move 'backwards' into it's own last-position body
    // doesn't prevent general body-collisions
    // if detected, advances in last-used direction
    if (dir === undefined || eq(snek(1), head)) {
      head.x = 2 * snek(0).x - snek(1).x
      head.y = 2 * snek(0).y - snek(1).y
    }

    if (
      snake.every(body => !eq(head, body))
      &&
      0 <= head.x && head.x <= 7
      &&
      0 <= head.y && head.y <= 7
    ) {
      const ateApple = eq(head, apple)
      draw(grid, _, snek(-1).x, snek(-1).y)
      snake.splice(index = (index + 1) % snake.length, ateApple ? 0 : 1, head)
      draw(grid, COLOR_SNAKE_TAIL, snek(-1).x, snek(-1).y)
      draw(grid, COLOR_SNAKE_BODY, snek(1).x, snek(1).y)
      draw(grid, COLOR_SNAKE_HEAD, head.x, head.y)

      return ateApple ? 2 : 1
    }
    else {
      return 0
    }
  }

  function randApple() {
    if (!snake.some(body => eq(body, apple)))
      draw(grid, _, apple.x, apple.y)
    // no need to overwrite old apple's pixel, the snake did that already
    do {
      apple.x = randi(0, 7)
      apple.y = randi(0, 7)
    } while (snake.some(body => eq(body, apple)))
    draw(grid, COLOR_APPLE, apple.x, apple.y)
  }

  function reset() {
    grid.fill(_)
    const x = randi(2, 4)
    const y = randi(1, 6)
    index = 2
    snake.splice(0, snake.length, { x: x - 2, y }, { x: x - 1, y }, { x, y })
    draw(grid, COLOR_SNAKE_TAIL, x - 2, y)
    draw(grid, COLOR_SNAKE_BODY, x - 1, y)
    draw(grid, COLOR_SNAKE_HEAD, x, y)
    randApple()
  }

  let direction: DIR | undefined = undefined

  after(playerSelector(1, bot(snakeBot)), players => {
    const P = players[0]!

    if (P.id < 0) // is bot
      GAME_FPS *= 2

    handle.up = (id, state) => {
      if (id === P.id && state)
        direction = 0
    }
    handle.right = (id, state) => {
      if (id === P.id && state)
        direction = 1
    }
    handle.down = (id, state) => {
      if (id === P.id && state)
        direction = 2
    }
    handle.left = (id, state) => {
      if (id === P.id && state)
        direction = 3
    }
    handle.middle = (id, state) => {
      if (id === P.id && state && paused > 0.5 * GAME_FPS)
        paused = 0.5 * GAME_FPS
    }
    let showHighscore = false
    let beatHighscore = false
    let showPB = false
    let beatPB = false
    let newGame = true
    let paused: number = 0
    gameloop(() => {
      if (beatPB) {
        grid.fill(paused % 2 ? _ : Y)
        drawNumber(grid, memory.pbs[P.id]!, paused % 2 ? Y : _, memory.pbs[P.id]! < 10 ? 5 : 7)

        if (paused <= 0)
          beatPB = false
      }
      if (beatHighscore) {
        grid.fill(paused % 2 ? _ : M)
        drawNumber(grid, memory.highscore, paused % 2 ? M : _, memory.highscore < 10 ? 5 : 7)

        if (paused <= 0)
          beatHighscore = false
      }

      if (paused > 0) {
        paused--

        return
      }

      if (showPB) {
        paused = GAME_FPS * 2
        showPB = false
        grid.fill(_)
        drawNumber(grid, memory.pbs[P.id]!, Y, memory.pbs[P.id]! < 10 ? 5 : 7)
        return
      }

      if (showHighscore) {
        paused = GAME_FPS * 2
        showHighscore = false
        grid.fill(_)
        drawNumber(grid, memory.highscore, M, memory.highscore < 10 ? 5 : 7)
        return
      }

      if (newGame) {
        newGame = false
        reset()
      }

      const mov = move(direction)

      if (mov === 2) { // ate apple
        randApple()
      }
      else if (mov === 0) { // died
        direction = undefined
        newGame = true
        grid.fill(_)
        const score = snake.length - 3
        if (score > (memory.pbs[P.id] ?? 0)) {
          memory.pbs[P.id] = score

          if (P.id > 0 && score > memory.highscore) {
            paused = GAME_FPS * 10
            beatHighscore = true
            memory.highscore = score
            drawNumber(grid, score, M, score < 10 ? 5 : 7)
          }
          else {
            paused = GAME_FPS * 5
            beatPB = true
            showHighscore = true
            drawNumber(grid, score, Y, score < 10 ? 5 : 7)
          }
        }
        else {
          paused = GAME_FPS * 3
          showPB = true
          showHighscore = true
          drawNumber(grid, score, W, score < 10 ? 5 : 7)
        }
      }
    }, fps(GAME_FPS))
  })

  return () => { }
}

function snakeBot({ controls, grid }: BotData) {
  const head = findPixel(grid, COLOR_SNAKE_HEAD)
  const apple = findPixel(grid, COLOR_APPLE)

  if (!head || !apple) {
    controls.up = false
    controls.down = false
    controls.left = false
    controls.right = false
    controls.middle = true // fast-forward scoreboard
    return
  }

  const U = head.y < 7 && !(getPixel(grid, head.x, head.y + 1) & G3)
  const D = head.y > 0 && !(getPixel(grid, head.x, head.y - 1) & G3)
  const L = head.x > 0 && !(getPixel(grid, head.x - 1, head.y) & G3)
  const R = head.x < 7 && !(getPixel(grid, head.x + 1, head.y) & G3)

  controls.up = U && apple.y > head.y
  controls.down = D && apple.y < head.y

  controls.left = L && apple.x < head.x
  controls.right = R && apple.x > head.x

  if (!controls.up && !controls.down && !controls.left && !controls.right) {
    if (U)
      controls.up = true
    else if (D)
      controls.down = true
    else if (R)
      controls.right = true
    else if (L)
      controls.left = true
    // else fu**ed
  }

  controls.middle = false
}