import { PUBLIC } from "./db"

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

export function renderMatrix(grid8x8rgb: number[]) {
  PUBLIC.matrix(toMatrix(grid8x8rgb))
}