import { getFileName, getPropertyString, isYoutube } from "@mpv-easy/tool"

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

  return getFileName(p) || ""
}
