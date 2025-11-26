import { assert } from "./assert"

export function parsePercentage(s: string): number {
  assertPercentage(s)
  return Number.parseFloat(s.slice(0, -1)) / 100
}

export function isPercentage(s: string) {
  return s.charCodeAt(s.length - 1) === 37
}

export function assertPercentage(s: string) {
  assert(isPercentage(s), `not a valid percentage string: ${s}`)
}
