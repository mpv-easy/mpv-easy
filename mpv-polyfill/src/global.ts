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

const oldLog = g.console?.log

g.console = {
  log: oldLog ?? g.print,
  error: oldLog ?? g.print,
  info: oldLog ?? g.print,
  debug: oldLog ?? g.print,
  warn: oldLog ?? g.print,
}
