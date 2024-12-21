import { execAsync, getOs, Rect } from "./common"
import { joinPath, screenshotToFile } from "./mpv"
import { getDefaultBinDirPath, removeFile } from "./rs-ext"
import { existsSync } from "./fs"
import { detectCmd } from "./ext"
import { getTmpDir } from "./tmp"
import { randomId } from "./math"

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
    "-accurate_seek",
    "-ss",
    ss,
    "-to",
    to,
    "-i",
    videoPath,
    // "-c",
    // "copy",
    // "-map",
    // "0",
    // "-avoid_negative_ts",
    // "make_zero",
    // only video and audio
    // "-dn",
    "-y",
    outputPath,
  ]
  // console.log("cmd", cmd.join(" "))
  try {
    await execAsync(cmd)
  } catch (e) {
    return false
  }
  return true
}

export async function cropImage(
  rect: Rect,
  outputPath: string,
  ffmpeg: string,
) {
  const tmpDir = getTmpDir()
  const list = outputPath.split(".")
  const ext = list.at(-1) || "webp"
  const name = list.slice(0, -1).join(".")
  const tmpPath = joinPath(tmpDir, `${name}.${randomId()}.${ext}`)
  screenshotToFile(tmpPath)
  const { x, y, width, height } = rect
  const cmd = [
    ffmpeg,
    "-i",
    tmpPath,
    "-vf",
    `crop=${width}:${height}:${x}:${y}`,
    "-y",
    outputPath,
  ]
  // console.log("cmd", cmd.join(" "))
  try {
    await execAsync(cmd)
    // TODO: remove tmp file?
    // removeFile(tmpPath)
  } catch (e) {
    return false
  }
  return true
}

export async function cropVideo(
  videoPath: string,
  area: [number, number],
  rect: Rect,
  outputPath: string,
  ffmpeg: string,
) {
  const [ss, to] = area
  const { width, height, x, y } = rect
  const cmd = [
    ffmpeg,
    "-nostdin",
    "-ss",
    ss.toString(),
    "-to",
    to.toString(),

    "-i",
    videoPath,
    "-vf",

    `crop=${width}:${height}:${x}:${y}`,

    "-y",
    outputPath,
  ]
  // console.log("cmd: ", cmd.join(' '))
  try {
    await execAsync(cmd)
  } catch (e) {
    return false
  }
  return true
}
