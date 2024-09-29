import { SubtitleTypes, isHttp } from "./common"
import { fetch, fetchAsync, jellyfin } from "./rs-ext"
import { existsSync } from "./fs"
import {
  commandv,
  getProperty,
  getPropertyBool,
  getPropertyNative,
  getPropertyNumber,
  getPropertyString,
  joinPath,
  writeFile,
} from "./mpv"
import { getFileName } from "./path"
import type { TrackItem } from "./type"
import { getTmpDir } from "./tmp"
import { isYtdlp } from "./yt-dlp"
import { runCmdSync } from "./ext"

export function loadRemoteSubtitle(path = getProperty("path")) {
  if (!path?.length || isYtdlp(path)) {
    return
  }
  const trackList = (getPropertyNative<TrackItem[]>("track-list") || []).filter(
    (i) => i.type === "sub",
  )
  if (isHttp(path)) {
    const list = SubtitleTypes.map((i) => {
      const s = path.split(".").slice(0, -1)
      s.push(i)
      return s.join(".")
    })
    const tmp = getTmpDir()
    for (const url of list) {
      const name = getFileName(url)
      if (!name?.length) {
        continue
      }

      if (trackList.find((i) => i.title === name)) {
        continue
      }

      try {
        const resp = fetch(url)

        if (resp.status !== 200 || !resp.text?.length) {
          continue
        }

        const subPath = joinPath(tmp, name)
        writeFile(subPath, resp.text)
        commandv("sub-add", subPath)
      } catch (e) {
        print("loadRemoteSubtitle error:", e)
      }
    }
  } else {
    const list = SubtitleTypes.map((i) => {
      const s = path.split(".").slice(0, -1)
      s.push(i)
      return s.join(".")
    })
    for (const url of list) {
      const name = getFileName(url)
      if (trackList.find((i) => i.title === name)) {
        continue
      }
      if (existsSync(url)) {
        commandv("sub-add", url)
      }
    }
  }
}

export async function loadRemoteSubtitleAsync(path = getProperty("path")) {
  if (!path?.length || isYtdlp(path)) {
    return
  }
  const trackList = (getPropertyNative<TrackItem[]>("track-list") || []).filter(
    (i) => i.type === "sub",
  )
  if (isHttp(path)) {
    const list = SubtitleTypes.map((i) => {
      const s = path.split(".").slice(0, -1)
      s.push(i)
      return s.join(".")
    })
    const tmp = getTmpDir()
    for (const url of list) {
      const name = getFileName(url)
      if (!name?.length) {
        continue
      }

      if (trackList.find((i) => i.title === name)) {
        continue
      }

      try {
        const resp = await fetchAsync(url)

        if (resp.status !== 200 || !resp.text?.length) {
          continue
        }

        const subPath = joinPath(tmp, name)
        writeFile(subPath, resp.text)
        commandv("sub-add", subPath)
      } catch (e) {
        print("loadRemoteSubtitle error:", e)
      }
    }
  } else {
    const list = SubtitleTypes.map((i) => {
      const s = path.split(".").slice(0, -1)
      s.push(i)
      return s.join(".")
    })
    for (const url of list) {
      const name = getFileName(url)
      if (trackList.find((i) => i.title === name)) {
        continue
      }
      if (existsSync(url)) {
        commandv("sub-add", url)
      }
    }
  }
}

export type SubtitleTrack = {
  title?: string
  lang?: string
  selected: boolean
  id: number
  external: boolean
}

export function getSubtitleTracks(): SubtitleTrack[] {
  const tracks: SubtitleTrack[] = []
  const trackCount = getPropertyNumber("track-list/count") || 0
  for (let i = 0; i < trackCount; i++) {
    const type = getPropertyString(`track-list/${i}/type`)
    if (type === "sub") {
      const title = getPropertyString(`track-list/${i}/title`)
      const lang = getPropertyString(`track-list/${i}/lang`)
      const selected = getPropertyBool(`track-list/${i}/selected`)
      const external = getPropertyBool(`track-list/${i}/external`)
      const id = getPropertyNumber(`track-list/${i}/id`) || 0
      tracks.push({
        title,
        lang,
        selected,
        id,
        external,
      })
    }
  }

  return tracks
}

export function saveSrt(
  videoPath: string,
  trackId: number,
  ouptutPath: string,
): boolean {
  if (!videoPath) {
    return false
  }
  const subTrack = getSubtitleTracks().find((i) => i.id === trackId)
  if (!subTrack) {
    return false
  }
  const cmd = `ffmpeg -y -hide_banner -loglevel error -i "${videoPath}" -map 0:s:${subTrack.id - 1} "${ouptutPath}"`
  try {
    runCmdSync(cmd)
  } catch (e) {
    return false
  }
  return true
}
