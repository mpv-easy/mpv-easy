import {
  getFileName,
  getPropertyNumber,
  getPropertyString,
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

export function getVideoTitle(p: string) {
  const c = getPropertyNumber("playlist-count") || 0
  for (let i = 0; i < c; i++) {
    const a = getPropertyString(`playlist/${i}/filename`) ?? ""
    const b = getPropertyString(`playlist/${i}/title`) ?? ""
    if (p === a && b.length) {
      return b
    }
  }
}

export function getVideoName(p: string): string {
  // --playlist=m3u
  const title = getVideoTitle(p)

  if (title?.length) {
    return title
  }

  // yt-dl
  const forceTitle = getPropertyString("force-media-title")
  if (forceTitle?.length) {
    return forceTitle
  }

  // jellyfin
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
