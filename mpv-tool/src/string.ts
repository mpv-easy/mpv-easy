export function compareString(a: string, b: string) {
  return a.localeCompare(b)
}

export function textEllipsis(
  text: string,
  maxLength: number,
  ellipsis = "...",
) {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}
