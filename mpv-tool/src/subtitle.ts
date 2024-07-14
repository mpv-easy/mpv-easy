import { SubtitleTypes, isHttp } from "./common"
import { fetch, fetchAsync, jellyfin } from "./rs-ext"
import { existsSync } from "./fs"
import {
  commandv,
  getProperty,
  getPropertyNative,
  getenv,
  joinPath,
  writeFile,
} from "./mpv"
import { getFileName } from "./path"
import type { TrackItem } from "./type"
import { getTmpDir } from "./tmp"
import { isYtdlp } from "./yt-dlp"

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
