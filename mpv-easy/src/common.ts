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
  if (isYoutube(p)) {
    return getPropertyString("force-media-title") || ""
  }

  if (jellyfin.isJellyfin(p)) {
    const n = jellyfin.getNameFromUrl(p)
    if (n) {
      return getFileName(n) || ""
    }
  }

  return getFileName(p) || ""
}
