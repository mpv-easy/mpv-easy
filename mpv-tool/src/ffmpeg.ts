import { execAsync, getOs } from "./common"
import { joinPath } from "./mpv"
import { getDefaultBinDirPath } from "./rs-ext"
import { existsSync } from "./fs"
import { detectCmd } from "./ext"

const defaultMacExeName = "ffmpeg"
const defaultWindowsExeName = "ffmpeg.exe"
const defaultAndroidExeName = "ffmpeg"
const defaultLinuxExeName = "ffmpeg"

export function getFfmpegPath() {
  const os = getOs()
  switch (os) {
    case "darwin": {
      return joinPath(getDefaultBinDirPath(), defaultMacExeName)
    }
    case "linux": {
      return joinPath(getDefaultBinDirPath(), defaultLinuxExeName)
    }
    case "windows": {
      return joinPath(getDefaultBinDirPath(), defaultWindowsExeName)
    }
    case "android": {
      return joinPath(getDefaultBinDirPath(), defaultAndroidExeName)
    }
    default: {
      throw new Error(`mpv-easy-ext not support os: ${os}`)
    }
  }
}

export function detectFfmpeg(): false | string {
  const ffmpegExt = getFfmpegPath()

  if (existsSync(ffmpegExt)) {
    return ffmpegExt
  }

  return detectCmd("ffmpeg")
}

export async function cutVideo(
  area: [number, number],
  videoPath: string,
  outputPath: string,
  ffmpeg: string,
) {
  const [ss, to] = area.map((i) => i.toString())
  const cmd = [
    ffmpeg,
    "-nostdin",
    "-i",
    videoPath,
    "-ss",
    ss,
    "-to",
    to,
    "-c",
    "copy",
    "-map",
    "0",
    "-avoid_negative_ts",
    "make_zero",

    // only video and audio
    // "-dn",

    "-y",
    outputPath,
  ]
  try {
    await execAsync(cmd)
  } catch (e) {
    return false
  }
  return true
}
