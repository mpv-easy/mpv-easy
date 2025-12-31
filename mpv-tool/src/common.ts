import {
  type AlphabetKey,
  AlphabetKeys,
  type NumberKey,
  NumberKeys,
  loadfile,
  playlistClear,
  playlistMove,
  playlistPlayIndex,
  playlistRemove,
} from "./type"
import {
  commandNative,
  commandNativeAsync,
  getProperty,
  getPropertyNumber,
  getPropertyString,
  observePropertyNumber,
  osdMessage,
  setPropertyBool,
} from "./mpv"
import { normalize } from "./path"
import { DEFAULT_ASS_HEIGHT } from "./const"
import { isEqual } from "lodash-es"

export const VideoTypes =
  "3g2,3gp,asf,avi,f4v,flv,h264,h265,m2ts,m4v,mkv,mov,mp4,mp4v,mpeg,mpg,ogm,ogv,rm,rmvb,ts,vob,webm,wmv,y4m,m4s".split(
    ",",
  )
export const AudioTypes =
  "aac,ac3,aiff,ape,au,cue,dsf,dts,flac,m4a,mid,midi,mka,mp3,mp4a,oga,ogg,opus,spx,tak,tta,wav,weba,wma,wv".split(
    ",",
  )
export const ImageTypes =
  "apng,avif,bmp,gif,j2k,jp2,jfif,jpeg,jpg,jxl,mj2,png,svg,tga,tif,tiff,webp".split(
    ",",
  )
export const SubtitleTypes =
  "aqt,ass,gsub,idx,jss,lrc,mks,pgs,pjs,psb,rt,sbv,slt,smi,sub,sup,srt,ssa,ssf,ttxt,usf,vt,vtt".split(
    ",",
  )

export const FontTypes = "ttf,otf,woff,woff2,eot".split(",")
export const DllTypes = "dll,so,dylib".split(",")

export function endsWith(s: string | undefined, exts: string[]) {
  if (!s?.length) {
    return false
  }
  for (const i of exts) {
    if (i.length === 0) {
      return !s.includes(".")
    }
    if (s.endsWith(`.${i}`)) {
      return true
    }
  }
  return false
}

export function startsWith(s: string | undefined, exts: string[]) {
  if (!s?.length) {
    return false
  }
  for (const i of exts) {
    if (s.startsWith(i)) {
      return true
    }
  }
  return false
}

export function isRemote(s: string) {
  return startsWith(s, ["http", "webdav", "dav", "edl"])
}

export function isVideo(s: string, types = VideoTypes) {
  return endsWith(s.toLocaleLowerCase(), types)
}
export function isAudio(s: string, types = AudioTypes) {
  return endsWith(s.toLocaleLowerCase(), types)
}

export function isImage(s: string, types = ImageTypes) {
  return endsWith(s.toLocaleLowerCase(), types)
}

export function isFont(s: string, types = FontTypes) {
  return endsWith(s.toLocaleLowerCase(), types)
}
export function isDll(s: string, types = DllTypes) {
  return endsWith(s.toLocaleLowerCase(), types)
}

export function isPlayable(
  s: string,
  types = [...VideoTypes, ...AudioTypes, ...ImageTypes],
) {
  return endsWith(s, types)
}

export function isSubtitle(s: string, types = SubtitleTypes) {
  return endsWith(s, types)
}

export function playVideo(n: number) {
  playlistPlayIndex(n)
}

export function clearPlayList() {
  const _count = getPropertyNumber("playlist-count") || 0
  setPropertyBool("pause", true)
  playlistClear()
}

export function execSync(
  args: string[],
  playback_only = false,
  capture_stdout = true,
  capture_stderr = true,
): string {
  const r = commandNative({
    name: "subprocess",
    args,
    playback_only,
    capture_stdout,
    capture_stderr,
  })
  if (r.status < 0) {
    throw new Error(`subprocess error status:${r.status} stderr:${r.stderr}`)
  }
  return r.stdout.replaceAll("\r\n", "\n")
}

export function execAsync(
  args: string[],
  playback_only = false,
  capture_stdout = true,
  capture_stderr = true,
): Promise<string> {
  return new Promise((resolve, reject) => {
    commandNativeAsync(
      {
        name: "subprocess",
        args,
        playback_only,
        capture_stdout,
        capture_stderr,
      },
      (success, result, error) => {
        if (success) {
          if (result.status < 0) {
            reject(result.stderr.replaceAll("\r\n", "\n"))
          } else {
            resolve(result.stdout.replaceAll("\r\n", "\n"))
          }
        } else {
          reject(error)
        }
      },
    )
  })
}

const OsPatterns = {
  windows: "windows",
  linux: "linux",
  osx: "darwin",
  mac: "darwin",
  darwin: "darwin",
  "^mingw": "windows",
  "^cygwin": "windows",
  bsd$: "darwin",
  sunos: "darwin",
  android: "android",
} as const

export type OsType = (typeof OsPatterns)[keyof typeof OsPatterns]

export const Windows = "windows"
export const Linux = "linux"
export const Darwin = "darwin"
export const Android = "android"

let osCache: OsType
export function getOs(): OsType {
  if (osCache) {
    return osCache
  }
  function getPlatform() {
    return getProperty("platform")
  }
  let _osName: undefined | string
  function getUname() {
    if (_osName) {
      return _osName
    }

    // mpv-mock execSync maybe undefined
    const uname = execSync(["uname", "-s"]) || ""
    const rawOsName = uname.toLowerCase()

    // Default to "windows"
    _osName = "windows"

    for (const [pattern, value] of Object.entries(OsPatterns)) {
      if (rawOsName.match(new RegExp(pattern))) {
        _osName = value
        break
      }
    }
    return _osName
  }
  osCache = (getPlatform() || getUname()) as OsType
  return osCache
}

export function replacePlaylist(videoList: string[], play?: number) {
  setPropertyBool("pause", true)
  playlistClear()

  let count = getPropertyNumber("playlist-count") || 0

  for (const i of videoList) {
    loadfile(i, "append")
  }

  while (count--) {
    playlistRemove(0)
  }

  if (play !== undefined) {
    playlistPlayIndex(play)
    setPropertyBool("pause", false)
  }
}

export function commandExists(cmdName: string) {
  try {
    execSync(["which", cmdName])
    return true
  } catch (_error) {
    return false
  }
}

export function isNumber(input: string): boolean {
  return NumberKeys.includes(input as NumberKey)
}

export function isAlphabet(input: string): boolean {
  return AlphabetKeys.includes(input as AlphabetKey)
}

export type CoordRect = {
  x0: number
  y0: number
  x1: number
  y1: number
}

export class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  get cx() {
    return this.x + this.width / 2
  }
  get cy() {
    return this.y + this.height / 2
  }
  get x0() {
    return this.x
  }
  get y0() {
    return this.y
  }
  get x1() {
    return this.x + this.width
  }
  get y1() {
    return this.y + this.height
  }

  toCoord() {
    return {
      x0: this.x0,
      y0: this.y0,
      x1: this.x1,
      y1: this.y1,
    }
  }

  static fromCoord(coord: CoordRect) {
    const x = Math.min(coord.x0, coord.x1)
    const y = Math.min(coord.y0, coord.y1)
    const w = Math.abs(coord.x0 - coord.x1)
    const h = Math.abs(coord.y0 - coord.y1)
    return new Rect(x, y, w, h)
  }

  hasPoint(x: number, y: number) {
    if (x >= this.x0 && x <= this.x1 && y >= this.y0 && y <= this.y1) {
      return true
    }
    return false
  }

  placeCenter(other: Rect) {
    const dx = (this.width - other.width) / 2
    const dy = (this.height - other.height) / 2
    const nx = this.x + dx
    const ny = this.y + dy
    return new Rect(nx, ny, other.width, other.height)
  }

  scale(scale: number): Rect {
    return new Rect(
      this.x * scale,
      this.y * scale,
      this.width * scale,
      this.height * scale,
    )
  }
  scaleFromPoint(cx: number, cy: number, scaleX: number, scaleY: number) {
    const w = this.width * scaleX
    const h = this.height * scaleY

    const offsetX = (this.width - w) * ((cx - this.x) / this.width)
    const offsetY = (this.height - h) * ((cy - this.y) / this.height)

    const x = this.x + offsetX
    const y = this.y + offsetY
    return new Rect(x, y, w, h)
  }
  scaleCenterXY(scaleX: number, scaleY: number) {
    const centerX = this.x + this.width / 2
    const centerY = this.y + this.height / 2
    const w = this.width * scaleX
    const h = this.height * scaleY
    const x = centerX - w / 2
    const y = centerY - h / 2
    return new Rect(x, y, w, h)
  }
  offsetXY(offsetX: number, offsetY: number) {
    return new Rect(this.x + offsetX, this.y + offsetY, this.width, this.height)
  }
  scaleXY(scaleX: number, scaleY: number): Rect {
    return new Rect(
      this.x * scaleX,
      this.y * scaleY,
      this.width * scaleX,
      this.height * scaleY,
    )
  }
  intersection(other: Rect): Rect | undefined {
    const x1 = Math.max(this.x, other.x)
    const y1 = Math.max(this.y, other.y)

    const x2 = Math.min(this.x + this.width, other.x + other.width)
    const y2 = Math.min(this.y + this.height, other.y + other.height)

    const w = x2 - x1
    const h = y2 - y1

    if (w > 0 && h > 0) {
      return new Rect(x1, y1, w, h)
    }
    return undefined
  }
}

export type Cycle = {
  x: number
  y: number
  radius: number
}

export function assSizeToScreen() {}

export function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

let _scaleInit = false
let _lastH = -1
let _lastScale = 0
export function getAssScale(assHeight = DEFAULT_ASS_HEIGHT): number {
  if (!_scaleInit) {
    _scaleInit = true
    _lastH = getPropertyNumber("osd-height") || 0
    _lastScale = assHeight / _lastH
    observePropertyNumber("osd-height", (_, v) => {
      if (_lastH !== v && v) {
        _lastH = v
        _lastScale = assHeight / _lastH
      }
    })
  }
  return _lastScale
}

export function sleep(ms = 1000) {
  return new Promise((r) => setTimeout(r, ms))
}

export function choice<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined
  }
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

export function todo() {
  osdMessage("TODO: not yet implemented~", 5)
}

export function getMpvPlaylist(): string[] {
  const list: string[] = []

  const c = getPropertyNumber("playlist-count") || 0

  for (let i = 0; i < c; i++) {
    const p = normalize(getPropertyString(`playlist/${i}/filename`) ?? "")
    if (p.length) {
      list.push(p)
    }
  }
  return list
}

export function updatePlaylist(list: string[], playIndex = 0) {
  const oldList = getMpvPlaylist()
  const oldCount = oldList.length
  const path = normalize(getPropertyString("path") || "")

  if (oldCount === 0) {
    // replace all
    for (const i of list) {
      loadfile(i, "append")
    }
    playlistPlayIndex(playIndex)
    return
  }

  const oldListIndex = oldList.indexOf(path)
  if (playIndex === -1) {
    // clear and replace
    for (const i of list) {
      loadfile(i, "append")
    }
    playlistPlayIndex(playIndex + oldList.length)
    for (let i = 0; i < oldList.length; i++) {
      playlistRemove(0)
    }
    return
  }
  if (isEqual(oldList, list)) {
    if (oldListIndex !== playIndex) {
      playlistPlayIndex(playIndex)
    }
    return
  }
  if (oldListIndex === -1) {
    for (const i of list) {
      loadfile(i, "append")
    }
    playlistPlayIndex(playIndex + oldCount)
    for (let i = 0; i < oldList.length; i++) {
      playlistRemove(0)
    }
  } else {
    for (let i = 0; i < oldListIndex; i++) {
      playlistRemove(0)
    }
    for (let i = 0; i < oldCount - oldListIndex - 1; i++) {
      playlistRemove(1)
    }
    for (let i = 0; i < list.length; i++) {
      if (i === playIndex) {
        // loadfile(list[i], "append-play")
      } else {
        loadfile(list[i], "append")
      }
    }
    if (oldListIndex !== playIndex) {
      const targetIndex = oldListIndex < playIndex ? playIndex + 1 : playIndex
      playlistMove(oldListIndex, targetIndex)
    }
    if (getPropertyNumber("playlist-pos") !== playIndex) {
      playlistPlayIndex(playIndex)
    }
  }
}

export function printAndOsd(s: string, seconds = 1) {
  osdMessage(s, seconds)
  print(s)
}

export class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

export function getDisplayResolution():
  | undefined
  | {
      width: number
      height: number
    } {
  switch (getOs()) {
    case "windows": {
      const s = execSync([
        "powershell",
        "-c",
        `$display = Get-CimInstance -ClassName Win32_VideoController;"$($display.CurrentHorizontalResolution),$($display.CurrentVerticalResolution)"`,
      ])
        .trim()
        .split(",")
      if (s.length === 2) {
        return { width: +s[0], height: +s[1] }
      }
    }
    case "linux":
    case "darwin":
    case "android":
  }
  return undefined
}

export function getDisplayResolutionType(
  size = getDisplayResolution(),
): undefined | "720P" | "1080P" | "2K" | "4K" {
  if (!size) return
  const { width: w, height: h } = size
  if (w >= 3840 || h >= 2160) {
    return "4K"
  }
  if (w >= 2560 || h >= 1440) {
    return "2K"
  }
  if (w >= 1920 || h >= 1080) {
    return "1080P"
  }
  if (w >= 1280 || h >= 720) {
    return "720P"
  }
}
