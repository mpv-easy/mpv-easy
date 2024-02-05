export function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(x, max))
}

export function randomId() {
  return Math.random().toString(36).slice(2)
}
