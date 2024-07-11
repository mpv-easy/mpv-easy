import {
  getFileName,
  getPropertyString,
  isYoutube,
  jellyfin,
} from "@mpv-easy/tool"

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

export function getVideoName(p: string): string {
  const forceTitle = getPropertyString("force-media-title")
  if (forceTitle?.length) {
    return forceTitle
  }

  if (jellyfin.isJellyfin(p)) {
    const n = jellyfin.getNameFromUrl(p)
    if (n) {
      return getFileName(n) || ""
    }
  }

  return getFileName(p) || ""
}

export function getMaxStringLength(list: readonly string[]): number {
  let max = 0
  for (const i of list) {
    max = Math.max(i.length, max)
  }
  return max
}
export function stringListPadEnd(
  list: readonly string[],
  fill = " ",
): string[] {
  const max = getMaxStringLength(list)
  return list.map((i) => i.padEnd(max, fill))
}
export function stringListPadStart(
  list: readonly string[],
  fill = " ",
): string[] {
  const max = getMaxStringLength(list)

  return list.map((i) => i.padStart(max, fill))
}
