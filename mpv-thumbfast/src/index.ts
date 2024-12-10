import { definePlugin } from "@mpv-easy/plugin"
import {
  dirname,
  existsSync,
  getMpvExePath,
  getOs,
  getPropertyString,
  getScriptConfigDir,
  joinPath,
  mkdir,
  normalize,
  removeFile,
  commandNativeAsync,
  getPropertyBool,
  abortAsyncCommand,
  randomId,
  execSync,
  execAsync,
} from "@mpv-easy/tool"
export const pluginName = "@mpv-easy/thumbfast"

export type ThumbFastConfig = {
  path: string
  format: "rgba" | "bgra"
  maxWidth: number
  maxHeight: number
  startTime: number
  hrSeek: boolean
  network: boolean
  lifetime: number
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
export const defaultNetwork = true
export const defaultThumbPath = joinPath(
  getScriptConfigDir(),
  "mpv-easy-thumbfast.tmp",
)
export const defaultThumbStartTime = 0
export const defaultLifetime = 10000
export const defaultConfig: ThumbFastConfig = {
  path: defaultThumbPath,
  format: defaultThumbFormat,
  maxWidth: defaultThumbMaxWidth,
  maxHeight: defaultThumbMaxHeight,
  startTime: defaultThumbStartTime,
  hrSeek: defaultHrSeek,
  network: defaultNetwork,
  lifetime: defaultLifetime,
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

const ThumbFastSet = new Set<ThumbFast>()

export class ThumbFast {
  public path: string
  public format: "rgba" | "bgra"
  public maxWidth: number
  public maxHeight: number
  public ipcId = ""
  public startTime: number
  public thumbWidth: number
  public thumbHeight: number
  public network: boolean
  public subprocessId: number
  private prevRun = 0
  private lifetime = 0
  public hrSeek: boolean
  private mpvPath: string
  constructor(
    {
      path = defaultThumbPath,
      format = defaultThumbFormat,
      maxWidth = defaultThumbMaxWidth,
      maxHeight = defaultThumbMaxHeight,
      startTime = 0,
      videoWidth = 0,
      videoHeight = 0,
      hrSeek = defaultHrSeek,
      network = defaultNetwork,
      lifetime = defaultLifetime,
    }: Partial<ThumbFastConfig> & {
      videoWidth: number
      videoHeight: number
    } = { ...defaultConfig, videoHeight: 0, videoWidth: 0 },
  ) {
    if (existsSync(path)) {
      removeFile(path)
    }
    this.path = normalize(path)
    this.hrSeek = hrSeek
    this.format = format
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight
    this.startTime = startTime
    this.lifetime = lifetime
    const w = videoWidth
    const h = videoHeight
    const [thumbWidth, thumbHeight] = scaleToFit(w, h, maxWidth, maxHeight)
    this.thumbWidth = thumbWidth
    this.thumbHeight = thumbHeight
    this.network = network
    this.subprocessId = this.startIpc()
    this.mpvPath = normalize(getMpvExePath())
    ThumbFastSet.add(this)
  }

  private startIpc() {
    this.ipcId = `ipc_${randomId()}`
    const streamPath = getPropertyString("stream-open-filename")
    let videoPath = normalize(getPropertyString("path") || "")
    if (
      getPropertyBool("demuxer-via-network") &&
      streamPath?.length &&
      this.network &&
      streamPath !== videoPath
    ) {
      // remove description, it's too long
      videoPath = streamPath.replace(/,ytdl_description.*/, "")
    }

    const args = [
      this.mpvPath,
      videoPath,
      "--no-config",
      "--msg-level=all=no",
      "--idle",
      "--keep-open=always",
      "--pause",
      "--really-quiet",
      "--no-terminal",
      "--ao=null",
      // "--vo=null",
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
      `--hr-seek=${this.hrSeek ? "yes" : "no"}`,
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
      "--video-rotate=0",
      "--of=image2",
      "--ofopts=update=1",
      "--ocopy-metadata=no",
      "--sws-allow-zimg=no",
      "--media-controls=no",
      "--demuxer-max-bytes=512KiB",
      `--vf=scale=w=${this.thumbWidth}:h=${this.thumbHeight}:force_original_aspect_ratio=decrease,pad=w=${this.thumbWidth}:h=${this.thumbHeight}:x=-1:y=-1,format=${this.format}`,
      `--o=${this.path}`,
      `--input-ipc-server=${this.ipcId}`,
    ]

    // async: this cmd run forever
    return commandNativeAsync({
      name: "subprocess",
      args,
      playback_only: true,
      capture_stdout: true,
      capture_stderr: true,
    })
  }

  run(cmd: string) {
    // sync: waiting for image write to file
    const args = [
      getOs() === "windows" ? "cmd" : "sh",
      getOs() === "windows" ? "/c" : "-c",
      `echo ${cmd} > \\\\.\\pipe\\${this.ipcId}`,
      // `echo async seek ${time} absolute+keyframes > \\\\.\\pipe\\${this.ipcId}`,
      // `echo seek ${time} absolute+keyframes > \\\\.\\pipe\\${this.ipcId}`,
    ]
    return execSync(args, true, true, true)
  }

  runAsync(cmd: string) {
    const args = [
      getOs() === "windows" ? "cmd" : "sh",
      getOs() === "windows" ? "/c" : "-c",
      `echo ${cmd} > \\\\.\\pipe\\${this.ipcId}`,
      // `echo async seek ${time} absolute+keyframes > \\\\.\\pipe\\${this.ipcId}`,
      // `echo seek ${time} absolute+keyframes > \\\\.\\pipe\\${this.ipcId}`,
    ]
    return execAsync(args, true, true, true)
  }

  seek(time: number) {
    const now = Date.now()
    if (!this.prevRun) {
      this.prevRun = now
    }
    if (now - this.prevRun > this.lifetime) {
      this.prevRun = now
      this.exit()
      this.subprocessId = this.startIpc()
    }
    return this.run(`set time-pos ${time}`)
  }

  async exit() {
    try {
      // await this.runAsync("quit")
      await abortAsyncCommand(this.subprocessId)
    } catch (e) {
      console.log("ThumbFast abortAsyncCommand error: ", e)
    }
  }
}

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    const d = dirname(context[pluginName].path)
    if (d && !existsSync(d)) {
      mkdir(d)
    }
  },
  destroy() {
    for (const i of ThumbFastSet) {
      i.exit()
    }
  },
}))
