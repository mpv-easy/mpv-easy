import { assert } from "./assert"

export function parsePercentage(s: string): number {
  assertPercentage(s)
  return parseFloat(s.slice(0, -1)) / 100
}

export function isPercentage(s: string) {
  return s.endsWith("%")
}

export function assertPercentage(s: string) {
  assert(isPercentage(s), "not a valid percentage string: " + s)
}
