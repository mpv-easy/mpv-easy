let g: any = undefined
export function getGlobal() {
  if (g) return g
  g = Function("return this")()
  return g
}
g = getGlobal()
g.globalThis = g
g.global = g
g.Uint8Array = Array
g.self = g
// g.__global__ = undefined

g.console = {
  log: g.print,
  error: g.print,
  info: g.print,
  debug: g.print,
  warn: g.print,
}
