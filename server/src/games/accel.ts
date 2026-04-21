import { PUBLIC } from "../db"
import { type GameHandle } from "../game"
import { sub } from "../helpers"
import { R1, G1, B1, O as _, deltaLine, } from "../render"

export default function startGame(handle: GameHandle): () => void {
  const { grid, render } = handle

  sub(PUBLIC.accel, ({ x, y, z }) => {
    grid.fill(_)

    deltaLine(grid, x, 6, R1, 2)
    deltaLine(grid, y, 3, G1, 2)
    deltaLine(grid, z, 0, B1, 2)

    render(grid)
  }, true)

  handle.middle = (_, state) => {
    if (!state)
      return

    Promise.all([PUBLIC.game, PUBLIC.gamelist]).then(([game, gamelist]) => {
      const nextIndex = gamelist.indexOf(game) + 1 // if game not in list, defaults to zero-index
      PUBLIC.game(gamelist[nextIndex % gamelist.length]!)
    })
  }

  return () => { }
}