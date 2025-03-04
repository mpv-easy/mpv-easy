import { getGlobal } from "./global"

export function patch(v: any) {
  const g = getGlobal()
  for (const k of Object.keys(v)) {
    if (!g[k]) {
      g[k] = v[k]
    }
  }
}
