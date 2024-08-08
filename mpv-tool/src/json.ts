export function JSONStringify<T = any>(s: T): string {
  return JSON.stringify(s)
}

export function JSONParse<T>(s: string): T {
  return JSON.parse(s) as T
}
