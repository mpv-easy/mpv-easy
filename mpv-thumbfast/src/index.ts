import { definePlugin } from "@mpv-easy/plugin"
import {
  dir,
  existsSync,
  getMpvExePath,
  getOs,
  getPropertyString,
  getScriptConfigDir,
  joinPath,
  mkdir,
  normalize,
  isYtdlp,
  removeFile,
  commandNative,
  commandNativeAsync,
} from "@mpv-easy/tool"
export const pluginName = "@mpv-easy/thumbfast"

export type ThumbFastConfig = {
  path: string
  format: "rgba" | "bgra"
  maxWidth: number
  maxHeight: number
  ipcId: string
  startTime: number
  hrSeek: boolean
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: ThumbFastConfig
  }
}

export const defaultThumbMaxWidth = 360
export const defaultThumbMaxHeight = 360
export const defaultHrSeek = true
export const defaultThumbFormat = "bgra"
export const defaultThumbPath = joinPath(
  getScriptConfigDir(),
  "mpv-easy-thumbfast.tmp",
)
export const defaultThumbIpcId = "mpv-easy-thumbfast"
export const defaultThumbStartTime = 0
export const defaultConfig: ThumbFastConfig = {
  path: defaultThumbPath,
  format: defaultThumbFormat,
  maxWidth: defaultThumbMaxWidth,
  maxHeight: defaultThumbMaxHeight,
  ipcId: defaultThumbIpcId,
  startTime: defaultThumbStartTime,
  hrSeek: defaultHrSeek,
}

function scaleToFit(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) {
  const scaleW = width / maxWidth
  const scaleH = height / maxHeight
  const scale = Math.max(scaleH, scaleW)
  const w = width / scale
  const h = height / scale
  return [w | 0, h | 0]
}
export class ThumbFast {
  public path: string
  public format: "rgba" | "bgra"
  public maxWidth: number
  public maxHeight: number
  public ipcId: string
  public startTime: number

  public thumbWidth: number
  public thumbHeight: number

  constructor(
    {
      path = defaultThumbPath,
      format = defaultThumbFormat,
      maxWidth = defaultThumbMaxWidth,
      maxHeight = defaultThumbMaxHeight,
      ipcId = defaultThumbIpcId,
      startTime = 0,
      videoWidth = 0,
      videoHeight = 0,
      hrSeek = defaultHrSeek,
    }: Partial<ThumbFastConfig> & {
      videoWidth: number
      videoHeight: number
    } = { ...defaultConfig, videoHeight: 0, videoWidth: 0 },
  ) {
    const mpvPath = getMpvExePath()

    if (existsSync(path)) {
      removeFile(path)
    }
    this.path = path

    this.format = format
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight
    this.ipcId = ipcId
    this.startTime = startTime
    let videoPath = normalize(getPropertyString("path") || "")
    const w = videoWidth
    const h = videoHeight
    const [thumbWidth, thumbHeight] = scaleToFit(w, h, maxWidth, maxHeight)
    // resize 4x
    this.thumbWidth = thumbWidth & ~3
    this.thumbHeight = thumbHeight & ~3

    const streamPath = getPropertyString("stream-open-filename")
    if (
      isYtdlp(path) &&
      getPropertyString("demuxer-via-network") &&
      streamPath?.length &&
      streamPath !== path
    ) {
      videoPath = streamPath
    }
    const args = [
      mpvPath,
      "--no-config",
      "--msg-level=all=no",
      "--idle",
      "--keep-open=always",
      "--pause",
      "--really-quiet",
      "--terminal=no",
      "--ao=null",
      "--vo=null",
      "--load-auto-profiles=no",
      "--load-osd-console=no",
      "--load-scripts=no",
      "--load-stats-overlay=no",
      "--osc=no",
      "--vd-lavc-skiploopfilter=all",
      "--vd-lavc-skipidct=all",
      "--vd-lavc-software-fallback=1",
      "--vd-lavc-fast",
      "--vd-lavc-threads=2",
      "--hwdec=auto",
      "--edition=auto",
      "--vid=1",
      "--sub=no",
      `--hr-seek=${hrSeek ? "yes" : "no"}`,
      "--no-sub",
      "--no-audio",
      "--audio=no",
      "--sub-auto=no",
      "--audio-file-auto=no",
      "--start=0",
      "--ytdl=no",
      "--ytdl-format=worst",
      "--demuxer-readahead-secs=0",
      "--gpu-dumb-mode=yes",
      "--tone-mapping=clip",
      "--hdr-compute-peak=no",
      "--sws-allow-zimg=no",
      "--sws-fast=yes",
      "--sws-scaler=fast-bilinear",
      "--audio-pitch-correction=no",
      "--ovc=rawvideo",
      "--of=image2",
      "--ofopts=update=1",
      "--ocopy-metadata=no",
      "--sws-allow-zimg=no",
      "--demuxer-max-bytes=512KiB",
      `--vf=scale=w=${this.thumbWidth}:h=${this.thumbHeight}:force_original_aspect_ratio=decrease,pad=w=${this.thumbWidth}:h=${this.thumbHeight}:x=-1:y=-1,format=${this.format}`,
      `--o=${this.path}`,
      `--input-ipc-server=${this.ipcId}`,
      "--",
      videoPath,
    ]

    // async: this cmd run forever
    commandNativeAsync({
      name: "subprocess",
      args,
      playback_only: true,
      capture_stdout: true,
      capture_stderr: true,
    })
  }

  seek(time: number) {
    // sync: for waiting image write to file
    commandNative({
      name: "subprocess",
      args: [
        getOs() === "windows" ? "cmd" : "sh",
        getOs() === "windows" ? "/c" : "-c",
        `echo set time-pos ${time} > \\\\.\\pipe\\${this.ipcId}`,
        // `echo async seek ${time} absolute+keyframes > \\\\.\\pipe\\${this.ipcId}`,
        // `echo seek ${time} absolute+keyframes > \\\\.\\pipe\\${this.ipcId}`,
      ],
      playback_only: true,
      capture_stdout: true,
      capture_stderr: true,
    })
  }

  exit() {
    commandNative({
      name: "subprocess",
      args: [
        getOs() === "windows" ? "cmd" : "sh",
        getOs() === "windows" ? "/c" : "-c",
        `echo quit > \\\\.\\pipe\\${this.ipcId}`,
      ],
      playback_only: true,
      capture_stdout: true,
      capture_stderr: true,
    })
  }
}

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    const d = dir(context[pluginName].path)
    if (d && !existsSync(d)) {
      mkdir(d)
    }
  },
  destroy() {},
}))
