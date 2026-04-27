import { type GameHandle } from "../game"
import { R3 as R, B3 as B, G3 as G, Y3 as Y, W3 as W, O, draw, W1 as E } from "../render"

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

  // colors inspired by standard xbox-controller ABXY buttons + white for middle, like the glowing logo

  handle.up = (_, state) => {
    handle.grid[0] = handle.grid[0] === Y ? O : Y
    draw(handle.grid, state ? Y : O, 3, 6, 2, 2)
    handle.render(handle.grid)
  }

  handle.down = (_, state) => {
    handle.grid[0] = handle.grid[0] === G ? O : G
    draw(handle.grid, state ? G : O, 3, 0, 2, 2)
    handle.render(handle.grid)
  }

  handle.left = (_, state) => {
    handle.grid[0] = handle.grid[0] === B ? O : B
    draw(handle.grid, state ? B : O, 0, 3, 2, 2)
    handle.render(handle.grid)
  }

  handle.right = (_, state) => {
    handle.grid[0] = handle.grid[0] === R ? O : R
    draw(handle.grid, state ? R : O, 6, 3, 2, 2)
    handle.render(handle.grid)
  }

  handle.middle = (_, state) => {
    handle.grid[0] = handle.grid[0] === W ? O : W
    draw(handle.grid, state ? W : O, 3, 3, 2, 2)
    handle.render(handle.grid)
  }

  handle.render(handle.grid)

  return () => { }
}