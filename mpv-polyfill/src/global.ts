let g: any
export function getGlobal() {
  if (g) return g
  g = Function("return this")()
  return g
}
g = getGlobal()

for (const i of ["globalThis", "global", "self"]) {
  if (typeof g[i] !== "object") {
    g[i] = g
  }
}

const oldLog = g.console?.log
if (typeof oldLog !== "function") {
  g.console = {
    log: g.print,
    error: g.print,
    info: g.print,
    debug: g.print,
    warn: g.print,
  }
}
