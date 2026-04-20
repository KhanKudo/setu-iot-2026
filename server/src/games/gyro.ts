import { PUBLIC, type Database } from "../db"
import { type GameHandle } from "../game"
import { clampi } from "../helpers"
import { R, B, G, O, W } from "../render"

const _ = O
const grid = [
  _, _, _, _, _, _, _, _,
  _, _, _, _, _, _, _, _,
  _, _, _, _, _, _, _, _,
  _, _, _, _, _, _, _, _,
  _, _, _, _, _, _, _, _,
  _, _, _, _, _, _, _, _,
  _, _, _, _, _, _, _, _,
  _, _, _, _, _, _, _, _,
]

let render: GameHandle['render'] | null = null

function sub({ roll, pitch, yaw }: Database['public']['imu']) {
  grid.fill(_)
  grid.fill(R, 0, clampi(roll / 360 * 7))
  grid.fill(G, 8, 8 + clampi(pitch / 360 * 7))
  grid.fill(B, 16, 16 + clampi(yaw / 360 * 7))

  render?.(grid)
}

export default function startGame(handle: GameHandle): () => void {
  render = handle.render
  PUBLIC.imu.$onnow = sub

  return () => {
    PUBLIC.imu.$off = sub
  }
}