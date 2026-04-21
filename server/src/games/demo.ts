import { type GameHandle } from "../game"
import { randi } from "../helpers"
import { R, B, G, O, W } from "../render"

type Save = {
  players: Record<number, {
    position: { x: number, y: number }
    color: number
  }>
}

export default function startGame(handle: GameHandle<Save>): () => void {
  handle.memory = {
    players: handle.memory?.players ?? {}
  }

  function getPlayer(id: number) {
    return handle.memory!.players![id] ??= {
      position: { x: randi(0, 7), y: randi(0, 7) },
      color: (randi(0, 3) << 6) | (randi(0, 3) << 3) | randi(0, 3),
    }
  }

  function draw(render: GameHandle['render']) {
    const _ = O
    const grid = [
      _, B, _, _, _, _, W, _,
      B, B, _, _, _, _, W, W,
      _, _, _, _, _, _, _, _,
      _, _, _, _, _, _, _, _,
      _, _, _, _, _, _, _, _,
      _, _, _, _, _, _, _, _,
      G, G, _, _, _, _, R, R,
      _, G, _, _, _, _, R, _,
    ]

    for (const id in handle.memory!.players!) {
      const { position: { x, y }, color } = handle.memory!.players[id]!
      const index = x + (7 - y) * 8
      grid[index] = color
    }

    render(grid)
  }

  handle.up = (id, state) => {
    if (!state)
      return

    const { position: pos } = getPlayer(id)
    pos.y = (pos.y + 1) % 8
    draw(handle.render)
  }
  handle.down = (id, state) => {
    if (!state)
      return

    const { position: pos } = getPlayer(id)
    pos.y = (pos.y + 8 - 1) % 8
    draw(handle.render)
  }
  handle.right = (id, state) => {
    if (!state)
      return

    const { position: pos } = getPlayer(id)
    pos.x = (pos.x + 1) % 8
    draw(handle.render)
  }
  handle.left = (id, state) => {
    if (!state)
      return

    const { position: pos } = getPlayer(id)
    pos.x = (pos.x + 8 - 1) % 8
    draw(handle.render)
  }
  handle.middle = (id, state) => {
    if (!state)
      return

    const player = getPlayer(id)
    switch (player.color) {
      case 0o000:
        player.color = 0o333
        break
      case 0o333:
        player.color = 0o300
        break
      default:
        player.color = player.color >> 3
        break
    }
    draw(handle.render)
  }

  draw(handle.render)

  return () => {

  }
}