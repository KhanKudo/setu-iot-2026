import { PUBLIC } from "../db"
import { type GameHandle } from "../game"
import { sub } from "../helpers"
import { R1, B1, G1, O as _, deltaLine } from "../render"

export default function startGame(handle: GameHandle): () => void {
  const { grid, render } = handle

  sub(PUBLIC.gyro, ({ pitch, roll, yaw }) => {
    grid.fill(_)

    deltaLine(grid, (pitch > 180) ? (pitch - 360) / 180 : pitch / 180, 6, R1, 2)
    deltaLine(grid, (roll > 180) ? (roll - 360) / 180 : roll / 180, 3, G1, 2)
    deltaLine(grid, (yaw > 180) ? (yaw - 360) / 180 : yaw / 180, 0, B1, 2)

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