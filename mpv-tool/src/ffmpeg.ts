import { execAsync, getOs, isRemote, Rect } from "./common"
import { getenv, getMpvExeDir, getMpvExePath, joinPath, readdir } from "./mpv"
import { screenshotToFile } from "./type"
import { existsSync } from "./fs"
import { detectCmd } from "./ext"
import { getTmpDir } from "./tmp"
import { randomId } from "./math"
import { normalize, replaceExt } from "./path"
import { getCurrentSubtitle } from "./subtitle"
import { createLogger } from "./logger"

const log = createLogger("ffmpeg")

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
      throw new Error(`ffmpeg not found for os: ${os}`)
    }
  }
}
let FFMPEG_PATH: string | false | undefined
export function detectFfmpeg(): false | string {
  if (FFMPEG_PATH) return FFMPEG_PATH
  FFMPEG_PATH = getFfmpegPath()
  if (existsSync(FFMPEG_PATH)) {
    return FFMPEG_PATH
  }
  FFMPEG_PATH = detectCmd("ffmpeg")
  return FFMPEG_PATH
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
  _gifConfig: GifConfig | undefined,
  _ffmpeg: string,
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

  log.debug(`cutRemoteVideo: ${videoPath} [${area[0]}-${area[1]}]`)
  try {
    await execAsync(mpvCmd)
    return true
  } catch (e) {
    log.error(`cutRemoteVideo: mpv failed`, e)
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
  log.debug(`cutLocalVideo: ${videoPath} [${ss}-${to}] → ${outputPath}`)
  try {
    await execAsync(cmd)
  } catch (e) {
    log.error(`cutLocalVideo: ffmpeg failed`, e)
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
  log.debug(
    `cropImage: ${rect.width}x${rect.height}+${rect.x}+${rect.y} → ${outputPath}`,
  )
  try {
    await execAsync(cmd)
  } catch (e) {
    log.error(`cropImage: ffmpeg failed`, e)
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
  log.debug(`cropVideo: ${videoPath} [${ss}-${to}] ${width}x${height}`)
  try {
    await execAsync(cmd)
  } catch (e) {
    log.error(`cropVideo: ffmpeg failed`, e)
    return false
  }
  return true
}

// https://huggingface.co/ggerganov/whisper.cpp/tree/main
const WhisperModels = [
  "ggml-base-q5_1.bin",
  "ggml-base-q8_0.bin",
  "ggml-base.bin",
  "ggml-base.en-q5_1.bin",
  "ggml-base.en-q8_0.bin",
  "ggml-base.en.bin",
  "ggml-large-v1.bin",
  "ggml-large-v2-q5_0.bin",
  "ggml-large-v2-q8_0.bin",
  "ggml-large-v2.bin",
  "ggml-large-v3-q5_0.bin",
  "ggml-large-v3-turbo-q5_0.bin",
  "ggml-large-v3-turbo-q8_0.bin",
  "ggml-large-v3-turbo.bin",
  "ggml-large-v3.bin",
  "ggml-medium-q5_0.bin",
  "ggml-medium-q8_0.bin",
  "ggml-medium.bin",
  "ggml-medium.en-q5_0.bin",
  "ggml-medium.en-q8_0.bin",
  "ggml-medium.en.bin",
  "ggml-small-q5_1.bin",
  "ggml-small-q8_0.bin",
  "ggml-small.bin",
  "ggml-small.en-q5_1.bin",
  "ggml-small.en-q8_0.bin",
  "ggml-small.en.bin",
  "ggml-tiny-q5_1.bin",
  "ggml-tiny-q8_0.bin",
  "ggml-tiny.bin",
  "ggml-tiny.en-q5_1.bin",
  "ggml-tiny.en-q8_0.bin",
  "ggml-tiny.en.bin",
]

export function detectWhisperModel(): string | undefined {
  const envModel = getenv("WHISPER_MODEL")
  if (envModel && existsSync(envModel)) {
    return envModel
  }
  const d = getMpvExeDir()
  for (const i of readdir(d) || []) {
    if (WhisperModels.includes(i)) {
      return normalize(joinPath(d, i))
    }
  }
}

function formatFFmpegPath(path: string): string {
  return path.replace(/^([a-zA-Z]):(?=[/\\])/, "$1\\:")
}

export type whisperConfig = {
  model: string
  destination: string
  gpu?: boolean
  language?: string
  format: "srt" | "vtt"
}

function getWhisperVf(config: whisperConfig): string {
  const v: string[] = []
  const { model, destination, format, gpu, language } = config
  if (model) {
    v.push(`model='${formatFFmpegPath(model)}'`)
  }
  if (destination) {
    v.push(`destination='${formatFFmpegPath(destination)}'`)
  }
  if (format) {
    v.push(`format=${format}`)
  }
  if (language) {
    v.push(`language=${language}`)
  }
  if (gpu !== undefined) {
    v.push(`use_gpu=${+gpu}`)
  }

  return v.join(":")
}

export async function whisper(
  videoPath: string,
  config: whisperConfig,
  ffmpeg: string,
) {
  const cmd = [
    ffmpeg,
    "-y",
    "-nostdin",
    "-i",
    videoPath,
    "-vn",
    "-af",
    `whisper=${getWhisperVf(config)}`,
    "-f",
    "null",
    "-",
  ]

  log.debug(
    `whisper: ${videoPath} model=${config.model} lang=${config.language || "auto"}`,
  )
  try {
    await execAsync(cmd)
  } catch (e) {
    log.error(`whisper: ffmpeg failed`, e)
    return false
  }
  return true
}

export async function imageToRaw(
  inputPath: string,
  outputPath: string,
  pixFmt: string,
  ffmpeg: string,
) {
  const cmd = [
    ffmpeg,
    "-y",
    "-nostdin",
    "-i",
    inputPath,
    "-f",
    "rawvideo",
    "-pix_fmt",
    pixFmt,
    outputPath,
  ]

  log.debug(`imageToRaw: ${inputPath} → ${outputPath} pixFmt=${pixFmt}`)
  try {
    await execAsync(cmd)
  } catch (e) {
    log.error(`imageToRaw: ffmpeg failed`, e)
    return false
  }
  return true
}
