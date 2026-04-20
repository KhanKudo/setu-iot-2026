import { CONTROLS, PRIVATE, PUBLIC, type Database } from "./db"
import type { DataType } from "@khankudo/kisdb"
import { renderMatrix } from "./render"
import startDemo from "./games/demo"
import startPong from "./games/pong"
import startGyro from "./games/gyro"
import { onActiveStopped } from "./helpers"

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
  grid: number[]
}

export type Controls = Record<keyof Omit<Database['controls'], 'imu'>, boolean>

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
export let activeHandle: GameHandle | null = null
let stopActive: () => void = () => { }

PUBLIC.game.$onnow = async game => {
  if (game === activeGame)
    return

  const newGameSave = game === null ? null : PRIVATE.gamedata[game]()

  if (activeGame !== null) {
    for (const func of onActiveStopped)
      func()
    onActiveStopped.clear()
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
    grid: new Array(64).fill(0),
    save: async () => {
      await PRIVATE.gamedata[game](memory)
    },
  }

  try {
    switch (game) {
      case 'demo':
        stopActive = startDemo(activeHandle)
        break
      case 'pong':
        stopActive = startPong(activeHandle)
        break
      case 'gyro':
        stopActive = startGyro(activeHandle)
        break
      default:
        stopActive = () => { }
        console.error(`UNKNOWN GAME SELECTED: "${game}"`)
    }
  } catch (err) {
    console.error(`Game [${game}] failed to start with error:`, err)
  }
}

process.on('SIGINT', async () => {
  if (activeGame) {
    await PRIVATE.gamedata[activeGame](activeHandle?.memory)
    console.log(`gamedata saved [${activeGame}]`)
  }
  process.exit(0)
})