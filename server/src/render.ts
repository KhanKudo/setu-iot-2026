import { PUBLIC } from "./db"
import { clampf } from "./helpers"

function toMatrix(grid: number[]): string {
  return grid.reduce((str, x) => str + String.fromCharCode(48 + ((Math.floor(x / 0o100) << 4) | (Math.floor((x % 0o100) / 0o10) << 2) | (x % 0o10))), '')
}

// ----- COLORS -----
export const O = 0o000

export const R1 = 0o100
export const R = 2 * R1
export const R3 = 3 * R1

export const G1 = 0o010
export const G = 2 * G1
export const G3 = 3 * G1

export const B1 = 0o001
export const B = 2 * B1
export const B3 = 3 * B1

export const W1 = (R1 + G1 + B1)
export const W = 2 * W1
export const W3 = 3 * W1

export const C1 = (G1 + B1)
export const C = 2 * C1
export const C3 = 3 * C1

export const M1 = (R1 + B1)
export const M = 2 * M1
export const M3 = 3 * M1

export const Y1 = (R1 + G1)
export const Y = 2 * Y1
export const Y3 = 3 * Y1

export const K = O
// ----- colors -----

let lastMatrix: string | null = null
export function renderMatrix(grid8x8rgb: number[]) {
  const matrix = toMatrix(grid8x8rgb)
  if (lastMatrix === matrix)
    return
  lastMatrix = matrix
  PUBLIC.matrix(matrix)
}

// grid must be 8x8
export function draw(grid: number[], color: number, x: number, y: number, w: number = 1, h: number = 1) {
  for (let i = Math.max(0, x); i < Math.min(8, x + w); i++) {
    for (let j = Math.max(0, y); j < Math.min(8, y + h); j++) {
      grid[i + (7 - j) * 8] = color
    }
  }
}

// posY -> the lower y-coordinate of the deltaline
// color1 -> lowest brightness of select color, must still be valid after col*2 and col*3
// valueNorm -> -1..1 (is auto-clamped)
export function deltaLine(grid: number[], valueNorm: number, posY: number = 0, color1: number = W1, height: number = 1, posX: number = 4, screenWidth: number = 8) {
  const RES = 3
  const HIGH = height
  const x = Math.round(Math.abs(clampf(valueNorm, -1, 1)) * screenWidth * RES)
  if (x === 0)
    return

  const wx = Math.floor(x / (RES * HIGH))
  const rx = Math.round(x % (RES * HIGH))

  if (valueNorm > 0) {
    draw(grid, color1 * RES, posX, posY, wx, HIGH)
    const hx = Math.floor(rx / HIGH)
    if (hx > 0)
      draw(grid, color1 * hx, posX + wx, posY, 1, HIGH)
    if (rx % HIGH)
      draw(grid, color1 * (hx + 1), posX + wx, posY, 1, rx % HIGH)
  }
  else if (valueNorm < 0) {
    draw(grid, color1 * RES, posX - wx, posY, wx, HIGH)
    const hx = Math.floor(rx / HIGH)
    if (hx > 0)
      draw(grid, color1 * hx, posX - wx - 1, posY, 1, HIGH)
    if (rx % HIGH)
      draw(grid, color1 * (hx + 1), posX - wx - 1, posY, 1, rx % HIGH)
  }
}

const _ = false
const X = true

const gridNumbers: Readonly<boolean[][]> = [
  [
    X, X, X, X,
    X, _, _, X,
    X, _, _, X,
    X, _, _, X,
    X, _, _, X,
    X, _, _, X,
    X, _, _, X,
    X, X, X, X,
  ],
  [
    _, _, X, _,
    _, X, X, _,
    X, _, X, _,
    _, _, X, _,
    _, _, X, _,
    _, _, X, _,
    _, _, X, _,
    _, _, X, _,
  ],
  [
    X, X, X, X,
    _, _, _, X,
    _, _, _, X,
    X, X, X, X,
    X, _, _, _,
    X, _, _, _,
    X, _, _, _,
    X, X, X, X,
  ],
  [
    X, X, X, X,
    _, _, _, X,
    _, _, _, X,
    X, X, X, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
    X, X, X, X,
  ],
  [
    X, _, _, X,
    X, _, _, X,
    X, _, _, X,
    X, X, X, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
  ],
  [
    X, X, X, X,
    X, _, _, _,
    X, _, _, _,
    X, X, X, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
    X, X, X, X,
  ],
  [
    X, X, X, X,
    X, _, _, _,
    X, _, _, _,
    X, X, X, X,
    X, _, _, X,
    X, _, _, X,
    X, _, _, X,
    X, X, X, X,
  ],
  [
    X, X, X, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
  ],
  [
    X, X, X, X,
    X, _, _, X,
    X, _, _, X,
    X, X, X, X,
    X, _, _, X,
    X, _, _, X,
    X, _, _, X,
    X, X, X, X,
  ],
  [
    X, X, X, X,
    X, _, _, X,
    X, _, _, X,
    X, X, X, X,
    _, _, _, X,
    _, _, _, X,
    _, _, _, X,
    X, X, X, X,
  ],
]

// only positive numbers supported, automatically uses Math.abs
// posX refers to the bottom-right corner
export function drawNumber(grid: number[], num: number, color: number, posX: number = 7, fillColor?: number) {
  do {
    const digit = Math.abs(num) % 10

    for (let y = 7; y >= 0; y--) {
      for (let x = 0; x <= 3; x++) {
        const ni = (7 - y) * 4 + x
        if (gridNumbers[digit]?.[ni])
          draw(grid, color, x - 3 + posX, y)
        else if (fillColor !== undefined)
          draw(grid, fillColor, x - 3 + posX, y)
      }
    }

    posX -= 4
  } while ((num = Math.floor(num / 10)) !== 0)
}

export function findPixel(grid: number[], color: number): null | { x: number, y: number } {
  const index = grid.indexOf(color)
  if (index === -1)
    return null
  return {
    x: index % 8,
    y: 7 - Math.floor(index / 8)
  }
}

export function getPixel(grid: number[], xy: { x: number, y: number }): number
export function getPixel(grid: number[], x: number, y: number): number
export function getPixel(grid: number[], xOrXY: { x: number, y: number } | number, y?: number): number {
  const x = typeof xOrXY === 'number' ? xOrXY : xOrXY.x
  y ??= (xOrXY as { y: number }).y

  if (x < 0 || x > 7 || y < 0 || y > 7)
    return O

  return grid[x + (7 - y) * 8]!
}