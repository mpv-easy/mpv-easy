import {
  fileInfo,
  getFileName,
  getPlaylist,
  getPlaylistPath,
  getPropertyNumber,
  getPropertyString,
  jellyfin,
} from "@mpv-easy/tool"

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

function getNameFromPlaylist(p: string): string | undefined {
  const list = getPlaylist()
  return list.find((i) => i.filename === p)?.title
}

export function getVideoName(p: string): string {
  if (getPlaylistPath()?.length) {
    const name = getNameFromPlaylist(p)
    if (name?.length) {
      return name
    }
  }

  // Some video files contain a title field. For consistency reasons
  // we use the file name first in the playlist and history component,
  // and the title first in the title component.
  if (fileInfo(p)) {
    return getFileName(p) || ""
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
