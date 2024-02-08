import stringify from "fast-safe-stringify"

export function JSONStringify<T = any>(s: T): string {
  return stringify(s)
}
