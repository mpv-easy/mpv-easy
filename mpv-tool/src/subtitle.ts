import {
  SubtitleTypes,
  execAsync,
  isRemote,
  isSubtitle,
  printAndOsd,
} from "./common"
import { fetch } from "./fetch"
import { existsSync } from "./fs"
import {
  getProperty,
  getPropertyNative,
  joinPath,
  readFile,
  writeFile,
} from "./mpv"
import { getFileName, replaceExt } from "./path"
import { subAdd, type TrackItem } from "./type"
import { getTmpDir } from "./tmp"
import { isYtdlp } from "./yt-dlp"
import { detectFfmpeg } from "./ffmpeg"

export function loadLocalSubtitle(path: string) {
  const list = SubtitleTypes.map((i) => {
    return replaceExt(path, i)
  })
  const trackList = getSubtitleTracks()
  for (const url of list) {
    const name = getFileName(url)
    if (trackList.find((i) => i.title === name)) {
      continue
    }
    if (existsSync(url) && isSubtitle(url)) {
      if (trackList.find((i) => i.externalFilename === url)) {
        continue
      }
      subAdd(url, "cached")
    }
  }
}

// FIXME: remove the synchronous version to prevent blocking UI rendering when loading remote subtitles
// export async function loadRemoteSubtitle(path = getProperty("path")) {
//   if (!path?.length || isYtdlp(path)) {
//     return
//   }
//   if (isRemote(path)) {
//     const list = SubtitleTypes.map((i) => {
//       const s = path.split(".").slice(0, -1)
//       s.push(i)
//       return s.join(".")
//     })
//     const tmp = getTmpDir()
//     for (const url of list) {
//       const name = getFileName(url)
//       if (!name?.length) {
//         continue
//       }
//       const trackList = getSubtitleTracks()
//       if (trackList.find((i) => i.title === name)) {
//         continue
//       }

//       try {
//         const resp = await fetch(url)

//         if (resp.status !== 200 || !resp.text?.length) {
//           continue
//         }

//         const text = await resp.text()
//         if (!text.length) {
//           continue
//         }
//         const subPath = joinPath(tmp, name)
//         writeFile(subPath, text)
//         commandv("sub-add", subPath)
//       } catch (e) {
//         print("loadRemoteSubtitle error:", e)
//       }
//     }
//   } else {
//     loadLocalSubtitle(path)
//   }
// }

export async function loadRemoteSubtitleAsync(path = getProperty("path")) {
  if (!path?.length || isYtdlp(path)) {
    return
  }
  if (!isRemote(path)) {
    return
  }

  const list = SubtitleTypes.map((i) => {
    return replaceExt(path, i)
  })
  for (const url of list) {
    const name = getFileName(url)
    if (!name?.length) {
      continue
    }

    const trackList = getSubtitleTracks()
    if (trackList.find((i) => i.title === name)) {
      continue
    }

    try {
      const resp = await fetch(url)

      if (resp.status !== 200 || !resp.text?.length) {
        continue
      }
      const text = await resp.text()
      if (!text.length) {
        continue
      }

      const tmp = getTmpDir()
      const subPath = joinPath(tmp, name)
      writeFile(subPath, text)
      subAdd(subPath, "cached")
    } catch (e) {
      print("loadRemoteSubtitle error:", e)
    }
  }
}

export type SubtitleTrack = {
  title?: string
  lang?: string
  selected?: boolean
  id: number
  external?: boolean
  externalFilename?: string
}

export function getSubtitleTracks(): SubtitleTrack[] {
  const tracks: SubtitleTrack[] = []
  const list = getPropertyNative("track-list", []).filter(
    (i) => i.type === "sub",
  )
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const title = item.title
    const lang = item.lang
    const selected = item.selected
    const external = item.external
    const id = item.id
    const externalFilename = item["external-filename"]
    tracks.push({
      title,
      lang,
      selected,
      id,
      external,
      externalFilename,
    })
  }

  return tracks
}

export function getCurrentSubtitle() {
  return getSubtitleTracks().find((i) => i.selected)
}

export async function convertSubtitle(
  subPath: string,
  outputPath: string,
): Promise<string | undefined> {
  const ffmpeg = detectFfmpeg()
  if (!ffmpeg) {
    printAndOsd("ffmpeg not found")
    return undefined
  }

  const cmd = [
    ffmpeg,
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    subPath,
    outputPath,
  ]
  // console.log('cmd: ',cmd.join(' '))
  try {
    await execAsync(cmd)
  } catch (e) {
    return undefined
  }
  return readFile(outputPath)
}

export async function saveSrt(
  videoPath: string,
  trackId: number,
  outputPath: string,
  segment: number[] = [],
): Promise<string | undefined> {
  if (!videoPath) {
    return undefined
  }
  const subTrack = getSubtitleTracks().find((i) => i.id === trackId)
  if (!subTrack) {
    return undefined
  }
  const ffmpeg = detectFfmpeg()
  if (!ffmpeg) {
    printAndOsd("ffmpeg not found")
    return undefined
  }

  const cmd = [
    ffmpeg,
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    videoPath,
    "-map",
    `0:s:${subTrack.id - 1}`,
  ]

  if (segment.length === 2) {
    cmd.push("-ss", segment[0].toString(), "-to", segment[1].toString())
  }

  cmd.push(outputPath)

  // console.log('cmd: ',cmd.join(' '))
  try {
    await execAsync(cmd)
  } catch (e) {
    return undefined
  }
  return readFile(outputPath)
}
