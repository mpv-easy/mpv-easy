import { assert } from "./assert"
import {
  AlphabetKey,
  AlphabetKeys,
  DEFAULT_ASS_HEIGHT,
  NumberKey,
  NumberKeys,
} from "./const"
import {
  command,
  commandNative,
  commandv,
  getOptions,
  getProperty,
  getPropertyNumber,
  osdMessage,
  print,
} from "./mpv"

export const VideoTypes =
  "3g2,3gp,asf,avi,f4v,flv,h264,h265,m2ts,m4v,mkv,mov,mp4,mp4v,mpeg,mpg,ogm,ogv,rm,rmvb,ts,vob,webm,wmv,y4m".split(
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
  "aqt,ass,gsub,idx,jss,lrc,mks,pgs,pjs,psb,rt,sbv,slt,smi,sub,sup,srt,ssa,ssf,ttxt,txt,usf,vt,vtt".split(
    ",",
  )

export function endsWith(s: string, exts: string[]) {
  for (const i of exts) {
    if (s.endsWith(`.${i}`)) {
      return true
    }
  }
  return false
}

export function startsWith(s: string, exts: string[]) {
  for (const i of exts) {
    if (s.startsWith(i)) {
      return true
    }
  }
  return false
}

export function isHttp(s: string) {
  return startsWith(s, ["http", "webdav", "dav"])
}

export function isVideo(s: string) {
  return endsWith(s, VideoTypes)
}
export function isAudio(s: string) {
  return endsWith(s, AudioTypes)
}

export function isImage(s: string) {
  return endsWith(s, ImageTypes)
}

export function isSubtitle(s: string) {
  return endsWith(s, SubtitleTypes)
}

export function addToPlaylist(v: string[]) {
  for (const i of v) {
    const count = getPropertyNumber("playlist-count") || 0
    commandv(
      "loadfile",
      i,
      "append",
      // count === 0 ? 'append-play' : 'append'
    )
  }
}

export function playVideo(n: number) {
  command(`playlist-play-index ${n}`)
}

export function clearPlayList() {
  const count = getPropertyNumber("playlist-count") || 0
  command("set pause yes")
  command("playlist-clear")
  // const pos = getPropertyNumber('playlist-pos');
  // for (let i = 0; i < count; i++) {
  //   command(`playlist-remove 0`);
  //   print('remove', i);
  // }
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
  }) as {
    error_string: string
    killed_by_us: boolean
    status: number
    stderr: string
    stdout: string
  }

  if (r.status < 0) {
    throw new Error(`subprocess error status:${r.status} stderr:${r.stderr}`)
  }
  return r.stdout
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
} as const

export type OsType = (typeof OsPatterns)[keyof typeof OsPatterns]

export const Windows = "windows"
export const Linux = "linux"
export const Darwin = "darwin"

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
    const uname = execSync(["uname", "-s"])
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
  command("set pause yes")

  command("playlist-clear")

  let count = getPropertyNumber("playlist-count") || 0

  for (const i of videoList) {
    commandv("loadfile", i, "append")
  }

  // commandv("playlist-play-index", count.toString())

  while (count--) {
    command("playlist-remove 0")
  }

  if (play !== undefined) {
    commandv("playlist-play-index", play.toString())

    command("set pause no")
  }
}
// export const osName =
// const options = getOptions() as any
// if (options.socket === "") {
//   if (osName === "windows") {
//     options.socket = "thumbfast";
//   } else {
//     options.socket = "/tmp/thumbfast";
//   }
// }
export function commandExists(cmdName: string) {
  try {
    // exec(['command', "-s", cmdName]);
    execSync(["which", cmdName])
    return true
  } catch (error) {
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
    return new Rect(
      coord.x0,
      coord.y0,
      coord.x1 - coord.x0,
      coord.y1 - coord.y0,
    )
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

export function getAssScale(): number {
  const osdHeight = getPropertyNumber("osd-height")

  assert(osdHeight, "osd-height error: " + getPropertyNumber("osd-height"))

  return DEFAULT_ASS_HEIGHT / osdHeight
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
