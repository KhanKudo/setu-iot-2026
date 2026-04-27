import { type GameHandle } from "../game"
import { R3 as R, B3 as B, G3 as G, Y3 as Y, W3 as W, O, draw, W1 as E, R as R2 } from "../render"

export default function startGame(handle: GameHandle): () => void {
  const _ = O
  handle.grid = [
    E, E, E, _, _, E, E, E,
    E, _, _, _, _, _, _, E,
    E, _, _, _, _, _, _, E,
    _, _, _, _, _, _, _, _,
    _, _, _, _, _, _, _, _,
    E, _, _, _, _, _, _, E,
    E, _, _, _, _, _, _, E,
    E, E, E, _, _, E, E, E,
  ]

  handle.input = (_, { up, down, left, right, middle }) => {
    handle.grid[0] = handle.grid[0] ? O : R2
    // colors inspired by standard xbox-controller ABXY buttons + white for middle, like the glowing logo
    draw(handle.grid, up ? Y : O, 3, 6, 2, 2)
    draw(handle.grid, down ? G : O, 3, 0, 2, 2)
    draw(handle.grid, left ? B : O, 0, 3, 2, 2)
    draw(handle.grid, right ? R : O, 6, 3, 2, 2)
    draw(handle.grid, middle ? W : O, 3, 3, 2, 2)
    handle.render(handle.grid)
  }

  handle.render(handle.grid)

  return () => { }
}