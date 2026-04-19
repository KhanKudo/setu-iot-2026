import type { DataType } from "@khankudo/kisdb"
import { CONTROLS, PRIVATE, PUBLIC, type Database } from "./db"
import { renderMatrix } from "./render"
import startDemo from "./games/demo"

export function randi(max: number = 1, min: number = 0): number {
  return Math.round(Math.random() * (max - min)) + min
}

export type GameHandle<T extends DataType | undefined = any> = {
  render: typeof renderMatrix
  controls: Readonly<Record<number, Controls>>
  input?: (id: number, controls: Readonly<Controls>) => void
  up?: (id: number, state: boolean) => void
  down?: (id: number, state: boolean) => void
  left?: (id: number, state: boolean) => void
  right?: (id: number, state: boolean) => void
  middle?: (id: number, state: boolean) => void
  memory?: Partial<T>
  save: Readonly<() => Promise<void>>
}

export type Controls = Record<keyof Database['controls'], boolean>

const controls: Record<number, Controls> = {}

function getControls(identity: number) {
  return controls[identity] ??= {
    up: false,
    down: false,
    left: false,
    right: false,
    middle: false,
  }
}

const timers: Record<string, Timer> = {}

function timeout(id: string, ms: number, callback: (() => void) | null) {
  if (id in timers)
    clearTimeout(timers[id])

  if (callback === null)
    return

  timers[id] = setTimeout(callback, ms)
}

function trigger(id: number, btns: Controls, key: keyof Controls) {
  activeHandle?.[key]?.(id, btns[key])
  activeHandle?.input?.(id, btns)
}

CONTROLS.up = async ({ identity }, state) => {
  const btns = getControls(identity)
  btns.up = state ?? true
  trigger(identity, btns, 'up')
  const id = 'up' + identity
  if (state === undefined)
    timeout(id, 50, () => { btns.up = false; trigger(identity, btns, 'up') })
  else
    timeout(id, 0, null)
}
CONTROLS.down = async ({ identity }, state) => {
  const btns = getControls(identity)
  btns.down = state ?? true
  trigger(identity, btns, 'down')
  const id = 'down' + identity
  if (state === undefined)
    timeout(id, 50, () => { btns.down = false; trigger(identity, btns, 'down') })
  else
    timeout(id, 0, null)
}
CONTROLS.right = async ({ identity }, state) => {
  const btns = getControls(identity)
  btns.right = state ?? true
  trigger(identity, btns, 'right')
  const id = 'right' + identity
  if (state === undefined)
    timeout(id, 50, () => { btns.right = false; trigger(identity, btns, 'right') })
  else
    timeout(id, 0, null)
}
CONTROLS.left = async ({ identity }, state) => {
  const btns = getControls(identity)
  btns.left = state ?? true
  trigger(identity, btns, 'left')
  const id = 'left' + identity
  if (state === undefined)
    timeout(id, 50, () => { btns.left = false; trigger(identity, btns, 'left') })
  else
    timeout(id, 0, null)
}
CONTROLS.middle = async ({ identity }, state) => {
  const btns = getControls(identity)
  btns.middle = state ?? true
  trigger(identity, btns, 'middle')
  const id = 'middle' + identity
  if (state === undefined)
    timeout(id, 50, () => { btns.middle = false; trigger(identity, btns, 'middle') })
  else
    timeout(id, 0, null)
}

let activeGame: Database['public']['game'] | null = null
let activeHandle: GameHandle | null = null
let stopActive: () => void = () => { }

PUBLIC.game.$onnow = async game => {
  if (game === activeGame)
    return

  const newGameSave = game === null ? null : PRIVATE.gamedata[game]()

  if (activeGame !== null) {
    stopActive()
    PRIVATE.gamedata[activeGame](activeHandle?.memory)
  }
  activeGame = game

  if (game === null)
    return

  const memory = await newGameSave as any

  activeHandle = {
    controls,
    render: renderMatrix,
    memory,
    save: async () => {
      await PRIVATE.gamedata[game](memory)
    },
  }

  switch (game) {
    case 'demo':
      stopActive = startDemo(activeHandle)
      break
    case 'pong':
      console.warn('PONG is not yet defined!')
      break
    default:
      stopActive = () => { }
      console.error(`UNKNOWN GAME SELECTED: "${game}"`)
  }
}

process.on('SIGINT', async () => {
  if (activeGame) {
    await PRIVATE.gamedata[activeGame](activeHandle?.memory)
    console.log(`gamedata saved [${activeGame}]`)
  }
  process.exit(0)
})