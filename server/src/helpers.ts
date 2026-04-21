import type { DataType } from "@khankudo/kisdb";
import type { ProxyType } from "@khankudo/kisdb/viewer/vanilla";
import { R3 as R, G3 as G, B3 as B, Y3 as Y, O as _, W, W1 as w } from "./render"
import { activeHandle, type Controls } from "./game";

export function randi(min: number = 0, max: number = 1): number {
  return Math.round(Math.random() * (max - min)) + min
}

export function clampi(num: number, min: number = 0, max: number = 7): number {
  return Math.min(max, Math.max(min, Math.round(num)))
}
export function clampf(num: number, min: number = -1, max: number = 1): number {
  return Math.min(max, Math.max(min, num))
}

const cooldowns: Map<any, number> = new Map()
export function cooldown(id: any, periodMs: number): boolean {
  const ms = cooldowns.get(id)
  const now = Date.now()
  if (!ms || ms + periodMs < now) {
    cooldowns.set(id, now)
    return true
  }
  else {
    return false
  }
}

export const onActiveStopped: Set<() => void> = new Set()

// handles the ending the subscription ($off), when the game is stopped
export function sub<T extends DataType | undefined = any>(data: ProxyType<T>, func: (data: T) => void, callnow: boolean = true): void {
  const sub = callnow ? '$onnow' : '$on';
  (data as any)[sub] = func
  onActiveStopped.add(() => (data as any).$off = func)
}

// handles the promise rejection, if the game is stopped
export function after<T>(data: Promise<T>, func: (data: T) => void): void {
  const stop = () => { }
  onActiveStopped.add(stop)
  data.then(data => {
    if (onActiveStopped.delete(stop))
      func(data)
  }, err => {
    onActiveStopped.delete(stop)
    console.error('A game\'s "after" promise was rejected with error:', err)
  })
}

export type BotData = {
  i: number
  id: number
  color: number
  controls: Controls
  grid: number[]
}

export type BotType = {
  id: number
  start(data: BotData): void
  stop(): void
}

let botId = -1
export function bot(tick: (data: BotData) => void, tickRateMs: number = fps(20), autorelease: boolean = false): BotType {
  let stopFunc: (() => void) | null = null
  const id = botId
  botId--
  return {
    id,
    start(data) {
      const stop = gameloop(() => {
        if (autorelease) {
          let released = false
          for (const _k in data.controls) {
            const key = _k as keyof Controls
            if (!data.controls[key])
              continue
            released = true;
            data.controls[key] = false
            activeHandle?.[key]?.(id, data.controls[key])
          }
          if (released)
            activeHandle?.input?.(id, data.controls)
        }
        tick(data)
        for (const key in data.controls) {
          activeHandle?.[key as keyof Controls]?.(id, data.controls[key as keyof Controls])
        }
        activeHandle?.input?.(id, data.controls)
      }, tickRateMs, true, false)
      stopFunc = () => {
        stop()
        delete (activeHandle!.controls as any)[id]
      }
      onActiveStopped.add(stopFunc);
      (activeHandle!.controls[id] as Controls) = data.controls
    },
    stop() {
      if (stopFunc)
        onActiveStopped.delete(stopFunc)
      stopFunc?.()
      stopFunc = null
    }
  }
}

// returns the selected player IDs
export async function playerSelector(count: number, ...bots: BotType[]): Promise<{ i: number, id: number, color: number, controls: Controls }[]> {
  if (!((bots.length > 0 ? 0 : 1) <= count && count <= 4))
    throw new Error(`Invalid player selection parameters! Count: ${count} players, allowed 1-4`)

  const arrowLeft: Readonly<number[]> = [
    _, _, _, _, _, _, _, _,
    _, w, _, _, _, _, _, _,
    _, w, _, _, _, _, _, _,
    W, w, _, _, _, _, _, _,
    W, w, _, _, _, _, _, _,
    _, w, _, _, _, _, _, _,
    _, w, _, _, _, _, _, _,
    _, _, _, _, _, _, _, _,
  ]
  const arrowRight: Readonly<number[]> = [
    _, _, _, _, _, _, _, _,
    _, _, _, _, _, _, w, _,
    _, _, _, _, _, _, w, _,
    _, _, _, _, _, _, w, W,
    _, _, _, _, _, _, w, W,
    _, _, _, _, _, _, w, _,
    _, _, _, _, _, _, w, _,
    _, _, _, _, _, _, _, _,
  ]

  const countGrid: Readonly<number[][]> = [
    [
      _, W, W, W, _, _, _, _,
      W, _, _, _, W, _, _, _,
      W, _, _, _, W, _, _, _,
      W, _, w, _, W, _, _, _,
      W, _, w, _, W, _, _, _,
      W, _, _, _, W, _, _, _,
      W, _, _, _, W, _, _, _,
      _, W, W, W, _, _, _, _,
    ],
    [
      _, _, _, _, R, _, _, _,
      _, _, _, R, R, _, _, _,
      _, _, R, _, R, _, _, _,
      _, _, _, _, R, _, _, _,
      _, _, _, _, R, _, _, _,
      _, _, _, _, R, _, _, _,
      _, _, _, _, R, _, _, _,
      _, _, _, _, R, _, _, _,
    ],
    [
      _, _, G, G, G, G, _, _,
      _, _, _, _, _, G, _, _,
      _, _, _, _, _, G, _, _,
      _, _, G, G, G, G, _, _,
      _, _, G, _, _, _, _, _,
      _, _, G, _, _, _, _, _,
      _, _, G, _, _, _, _, _,
      _, _, G, G, G, G, _, _,
    ],
    [
      _, _, B, B, B, B, _, _,
      _, _, _, _, _, B, _, _,
      _, _, _, _, _, B, _, _,
      _, _, B, B, B, B, _, _,
      _, _, _, _, _, B, _, _,
      _, _, _, _, _, B, _, _,
      _, _, _, _, _, B, _, _,
      _, _, B, B, B, B, _, _,
    ],
    [
      _, _, Y, _, _, Y, _, _,
      _, _, Y, _, _, Y, _, _,
      _, _, Y, _, _, Y, _, _,
      _, _, Y, Y, Y, Y, _, _,
      _, _, _, _, _, Y, _, _,
      _, _, _, _, _, Y, _, _,
      _, _, _, _, _, Y, _, _,
      _, _, _, _, _, Y, _, _,
    ],
  ]

  const min = Math.max(0, count - bots.length)
  const max = count

  const handle = activeHandle
  if (!handle)
    throw new Error('No active game handle found for player-selector!')

  const playerColors = [R, G, B, Y]
  const grid: Readonly<number[][]> = [
    [
      W, W, W, W, _, _, _, R,
      W, _, _, W, _, _, R, R,
      W, _, _, W, _, R, _, R,
      W, W, W, W, _, _, _, R,
      W, _, _, _, _, _, _, R,
      W, _, _, _, _, _, _, R,
      W, _, _, _, _, _, _, R,
      W, _, _, _, _, _, _, R,
    ],
    [
      W, W, W, W, G, G, G, G,
      W, _, _, W, _, _, _, G,
      W, _, _, W, _, _, _, G,
      W, W, W, W, G, G, G, G,
      W, _, _, _, G, _, _, _,
      W, _, _, _, G, _, _, _,
      W, _, _, _, G, _, _, _,
      W, _, _, _, G, G, G, G,
    ],
    [
      W, W, W, W, B, B, B, B,
      W, _, _, W, _, _, _, B,
      W, _, _, W, _, _, _, B,
      W, W, W, W, B, B, B, B,
      W, _, _, _, _, _, _, B,
      W, _, _, _, _, _, _, B,
      W, _, _, _, _, _, _, B,
      W, _, _, _, B, B, B, B,
    ],
    [
      W, W, W, W, Y, _, _, Y,
      W, _, _, W, Y, _, _, Y,
      W, _, _, W, Y, _, _, Y,
      W, W, W, W, Y, Y, Y, Y,
      W, _, _, _, _, _, _, Y,
      W, _, _, _, _, _, _, Y,
      W, _, _, _, _, _, _, Y,
      W, _, _, _, _, _, _, Y,
    ],
  ]

  return new Promise((resolve, reject) => {
    const selected: { i: number, id: number, color: number, controls: Controls }[] = []

    let origInput = handle.input
    const stop = () => {
      handle.input = origInput
      reject('Stop called before promise could settle!')
    }
    onActiveStopped.add(stop)
    let chosenPlayerCount = bots.length ? null : count
    let currentPC = count

    function renderCountPick() {
      Object.assign(handle!.grid, countGrid[currentPC]!)
      for (let i = 0; i < 64; i++) {
        if (currentPC > min && arrowLeft[i] !== 0)
          handle!.grid[i] = arrowLeft[i]!
        if (currentPC < max && arrowRight[i] !== 0)
          handle!.grid[i] = arrowRight[i]!
      }
      handle!.render(handle!.grid)
    }

    if (bots.length) {
      renderCountPick()
    }
    else {
      handle.render(grid[0]!)
    }
    const wasOn: Set<number> = new Set()
    handle.input = (id, { middle, left, right }) => {
      if (selected.some(p => p.id === id))
        return

      if (chosenPlayerCount === null && (left || right)) {
        currentPC = clampi(currentPC - Number(left) + Number(right), min, max)
        renderCountPick()
        wasOn.delete(id)
        return
      }

      if (middle) {
        wasOn.add(id)
      }
      else if (wasOn.has(id)) {
        wasOn.delete(id)
        if (chosenPlayerCount === null) {
          chosenPlayerCount = currentPC
          if (currentPC > 0) {
            handle.render(grid[0]!)
            if (currentPC > 1)
              return
          }
        }

        if (chosenPlayerCount > 0)
          selected.push({ id, i: selected.length, color: playerColors[selected.length]!, controls: activeHandle?.controls?.[id]! })

        if (selected.length === chosenPlayerCount) {
          handle.input = origInput
          onActiveStopped.delete(stop)
          handle.grid.fill(_)

          for (let i = chosenPlayerCount; i < count; i++) {
            const botId = bots[i - chosenPlayerCount]!.id

            selected.push(<BotData>{
              i,
              color: playerColors[i]!,
              id: botId,
              grid: handle.grid,
              controls: {
                up: false,
                down: false,
                left: false,
                right: false,
                middle: false,
              }
            })
            bots[i - chosenPlayerCount]!.start(selected.at(-1) as BotData)
          }

          resolve(selected)
        }
        else {
          handle.render(grid[selected.length]!)
        }
      }
    }
  })
}

// sets up a javascript setInterval with the specified value and automatically destroys it when the game is stopped or the loop returns null
// also calls the loop immediately once on initialization
// returns a function that stops the loops once called
export function gameloop(loop: () => void | null, intervalMs: number, callnow: boolean = true, autorender: boolean = true): () => void {
  const func = () => {
    const res = loop()
    if (autorender)
      activeHandle?.render(activeHandle?.grid)
    if (res === null) {
      clearInterval(ref)
      onActiveStopped.delete(stop)
    }
  }
  const ref = setInterval(func, intervalMs)
  const stop = () => {
    clearInterval(ref)
  }
  onActiveStopped.add(stop)
  if (callnow)
    func()

  return () => {
    clearInterval(ref)
    onActiveStopped.delete(stop)
  }
}

// converts frames per second (f/Hz) into a timer period (T/ms) - uses Math.round
export function fps(hertz: number): number {
  return Math.round(1000 / hertz)
}