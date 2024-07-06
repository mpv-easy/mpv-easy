import stringify from "fast-safe-stringify"

export function JSONStringify<T = any>(s: T): string {
  return stringify(s)
}

export function JSONParse<T>(s: string): T {
  return JSON.parse(s) as T
}
