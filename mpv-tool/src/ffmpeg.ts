import { execAsync, getOs, isRemote, Rect } from "./common"
import { getMpvExeDir, getMpvExePath, joinPath } from "./mpv"
import { screenshotToFile } from "./type"
import { existsSync } from "./fs"
import { detectCmd } from "./ext"
import { getTmpDir } from "./tmp"
import { randomId } from "./math"
import { replaceExt } from "./path"
import { getCurrentSubtitle } from "./subtitle"
// import { getCurrentSubtitle, getSubtitleTracks } from "./subtitle"

const defaultMacExeName = "ffmpeg"
const defaultWindowsExeName = "ffmpeg.exe"
const defaultAndroidExeName = "ffmpeg"
const defaultLinuxExeName = "ffmpeg"

export function getFfmpegPath() {
  const os = getOs()
  switch (os) {
    case "darwin": {
      return joinPath(getMpvExeDir(), defaultMacExeName)
    }
    case "linux": {
      return joinPath(getMpvExeDir(), defaultLinuxExeName)
    }
    case "windows": {
      return joinPath(getMpvExeDir(), defaultWindowsExeName)
    }
    case "android": {
      return joinPath(getMpvExeDir(), defaultAndroidExeName)
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

export type GifConfig = {
  fps: number
  maxWidth: number
  flags: string
}

export async function cutRemoteVideo(
  area: [number, number],
  videoPath: string,
  outputPath: string,
  gifConfig: GifConfig | undefined,
  ffmpeg: string,
) {
  const mpvPath = getMpvExePath()

  const mpvCmd = [
    mpvPath,
    videoPath,
    `--start=${area[0]}`,
    `--end=${area[1]}`,
    "--vo=lavc",
    `--o=${outputPath}`,
    "--of=mp4",
    "--ovc=libx264",
    "--ovcopts=crf=23,preset=medium,profile=baseline,level=3.1,tune=fastdecode",
    "--oac=aac",
    "--no-ocopy-metadata",
    "--quiet",
    "--sub-ass=yes",
    "--sub-ass-force-style=Fonts=true",
    "--vf=format=yuv420p",
  ]

  const sub = getCurrentSubtitle()
  if (sub) {
    if (sub.external) {
      mpvCmd.push(`--sub-files=${sub.externalFilename}`)
    } else {
      mpvCmd.push(`--sid=${sub.id}`)
    }
  }

  // TODO: Add vf
  // const vf = getProperty('vf');
  // if (vf) {
  //   mpvCmd.push(`--vf-append=${vf}`)
  // }

  // console.log("mpvCmd", mpvCmd.join(" "))
  try {
    await execAsync(mpvCmd)
    return true
  } catch {
    return false
  }
}

export async function cutVideo(
  area: [number, number],
  videoPath: string,
  outputPath: string,
  gifConfig: GifConfig | undefined,
  ffmpeg: string,
) {
  if (isRemote(videoPath)) {
    return cutRemoteVideo(area, videoPath, outputPath, gifConfig, ffmpeg)
  }
  return cutLocalVideo(area, videoPath, outputPath, gifConfig, ffmpeg)
}

export async function cutLocalVideo(
  area: [number, number],
  videoPath: string,
  outputPath: string,
  gifConfig: GifConfig | undefined,
  ffmpeg: string,
) {
  const [ss, to] = area.map((i) => i.toString())
  const cmd = [
    ffmpeg,
    "-y",
    "-nostdin",
    "-accurate_seek",
    "-ss",
    ss,
    "-to",
    to,
    "-i",
    videoPath,
  ]
  // const sub = getCurrentSubtitle()
  if (gifConfig) {
    const { fps, flags, maxWidth } = gifConfig
    const vf = [`fps=${fps}`, `scale=${maxWidth}:-1:flags=${flags}`]

    // if (sub) {
    //   if (sub.external) {
    //   } else {
    //     vf.push(`subtitles=${videoPath}:si=${sub.id}`)
    //   }
    // } else {
    //   cmd.push("-sn")
    // }

    cmd.push("-vf", vf.join(","))
    cmd.push(replaceExt(outputPath, "gif"))
  } else {
    // const vf: string[] = []
    // if (sub) {
    //   if (sub.external) {
    //   } else {
    //     vf.push(`subtitles=${videoPath}:si=${sub.id}`)
    //   }
    // } else {
    //   cmd.push("-sn")
    // }
    // if (vf.length) {
    //   cmd.push("-vf", vf.join(","))
    // }
    cmd.push("-c", "copy")
    cmd.push(outputPath)
  }
  // console.log("cmd:", cmd.join(' '))
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
  const tmpPath = joinPath(tmpDir, `${randomId()}.${ext}`)
  screenshotToFile(tmpPath)
  const { x, y, width, height } = rect
  const cmd = [
    ffmpeg,
    "-y",
    "-nostdin",
    "-accurate_seek",
    "-i",
    tmpPath,
    "-vf",
    `crop=${width}:${height}:${x}:${y}`,
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
  gifConfig: GifConfig | undefined,
  ffmpeg: string,
) {
  const [ss, to] = area
  const { width, height, x, y } = rect
  const cmd = [
    ffmpeg,
    "-y",
    "-nostdin",
    "-accurate_seek",
    "-ss",
    ss.toString(),
    "-to",
    to.toString(),
    "-i",
    videoPath,
    "-vf",
  ]
  if (gifConfig) {
    const { fps, flags, maxWidth } = gifConfig
    cmd.push(
      `crop=${width}:${height}:${x}:${y},fps=${fps},scale=${maxWidth}:-1:flags=${flags}`,
    )
    cmd.push(replaceExt(outputPath, "gif"))
  } else {
    cmd.push(`crop=${width}:${height}:${x}:${y}`, outputPath)
    cmd.push("-c", "copy", "-c:v", "libx265")
  }
  // console.log("cmd: ", cmd.join(' '))
  try {
    await execAsync(cmd)
  } catch (e) {
    return false
  }
  return true
}
