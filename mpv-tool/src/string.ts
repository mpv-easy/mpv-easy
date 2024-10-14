export function compareString(a: string, b: string) {
  return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase())
}
