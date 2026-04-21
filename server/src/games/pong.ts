import { type GameHandle } from "../game"
import { after, bot, clampi, cooldown, fps, gameloop, playerSelector, randi, type BotData } from "../helpers"
import { O as _, W, draw } from "../render"

export default function startGame(handle: GameHandle): () => void {
  const pos: [number, number] = [0, 0]
  const puck = { x: 0, y: 0 }
  const vel = { x: 0, y: 0 }

  function reset() {
    grid.fill(_)
    vel.x = randi() ? 1 : -1
    vel.y = randi() ? 1 : -1

    puck.y = randi(0, 7)

    puck.x = vel.x < 0 ? 6 : 1

    pos[0] = 3
    pos[1] = 3
  }

  const { grid, controls: C, render } = handle

  const gametick = fps(4)

  function pongBot({ color, controls, grid, i }: BotData) {
    controls.up = grid.indexOf(color) > grid.indexOf(W)
    controls.down = grid.lastIndexOf(color) < grid.indexOf(W)
  }

  after(playerSelector(2, bot(pongBot), bot(pongBot)), players => {
    reset()
    handle.up = (id, s) => {
      if (s && cooldown(id, gametick)) {
        const { i, color } = players.find(p => p.id === id)!
        draw(grid, _, i * 7, pos[i]!, 1, 2)
        pos[i] = clampi(pos[i]! + 1, 0, 6)
        draw(grid, color, i * 7, pos[i]!, 1, 2)
        render(grid)
      }
    }
    handle.down = (id, s) => {
      if (s && cooldown(id, gametick)) {
        const { i, color } = players.find(p => p.id === id)!
        draw(grid, _, i * 7, pos[i]!, 1, 2)
        pos[i] = clampi(pos[i]! - 1, 0, 6)
        draw(grid, color, i * 7, pos[i]!, 1, 2)
        render(grid)
      }
    }
    gameloop(() => {
      if (puck.x === 0 || puck.x === 7) {
        return reset()
        // return null
      }

      for (const { i, id, color } of players) {
        let dy = Number(C[id]!.up) - Number(C[id]!.down)
        if (dy !== 0 && !cooldown(id, gametick - 10))
          dy = 0
        draw(grid, _, i * 7, pos[i]!, 1, 2)
        pos[i] = clampi(pos[i]! + dy, 0, 6)
        draw(grid, color, i * 7, pos[i]!, 1, 2)
      }

      if (puck.y + vel.y > 7 || puck.y + vel.y < 0)
        vel.y = -vel.y

      if (
        puck.x === 1 && vel.x < 0 && (pos[0] === puck.y || pos[0] + 1 === puck.y || pos[0] === puck.y + vel.y || pos[0] + 1 === puck.y + vel.y)
        ||
        puck.x === 6 && vel.x > 0 && (pos[1] === puck.y || pos[1] + 1 === puck.y || pos[1] === puck.y + vel.y || pos[1] + 1 === puck.y + vel.y)
      ) {
        if (vel.x < 0) {
          if (vel.y > 0 && puck.y === pos[0] - 1 || vel.y < 0 && puck.y === pos[0] + 2)
            vel.y = -vel.y
          else if ((C[players[0]!.id]!.up != C[players[0]!.id]!.down))
            vel.y = C[players[0]!.id]!.up ? 1 : -1
        }
        else {
          if (vel.y > 0 && puck.y === pos[1] - 1 || vel.y < 0 && puck.y === pos[1] + 2)
            vel.y = -vel.y
          else if (vel.x > 0 && (C[players[1]!.id]!.up != C[players[1]!.id]!.down))
            vel.y = C[players[1]!.id]!.up ? 1 : -1
        }

        vel.x = -vel.x
      }

      if (puck.y + vel.y > 7 || puck.y + vel.y < 0)
        vel.y = -vel.y

      draw(grid, _, puck.x, puck.y)
      puck.y += vel.y
      puck.x += vel.x
      draw(grid, W, puck.x, puck.y)
    }, gametick)
  })

  return () => {

  }
}