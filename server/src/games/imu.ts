import { PUBLIC } from "../db"
import { type GameHandle } from "../game"
import { clampi, sub } from "../helpers"
import { R, B, G, O as _, W } from "../render"

export default function startGame({ grid, render }: GameHandle): () => void {
  sub(PUBLIC.imu, ({ x, y, z, pitch, roll, yaw }) => {
    grid.fill(_)
    const dx = clampi(x * 2, -4, 4)
    const fx = dx < 0 ? 4 + dx : 4
    const tx = dx > 0 ? 3 + dx : 3

    const dy = clampi(y * 2, -4, 4)
    const fy = dy < 0 ? 4 + dy : 4
    const ty = dy > 0 ? 3 + dy : 3

    const dz = clampi(z * 2, -4, 4)
    const fz = dz < 0 ? 4 + dz : 4
    const tz = dz > 0 ? 3 + dz : 3

    if (dx !== 0)
      grid.fill(R, fx, tx)
    if (dy !== 0)
      grid.fill(G, 8 + fy, 8 + ty)
    if (dz !== 0)
      grid.fill(B, 16 + fz, 16 + tz)

    grid.fill(R, 40, 40 + clampi(pitch / 360 * 7, 0, 7))
    grid.fill(G, 48, 48 + clampi(roll / 360 * 7, 0, 7))
    grid.fill(B, 56, 56 + clampi(yaw / 360 * 7, 0, 7))

    render(grid)
  }, true)

  return () => { }
}