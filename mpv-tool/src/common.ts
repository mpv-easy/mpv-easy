import {
  type AlphabetKey,
  AlphabetKeys,
  DEFAULT_ASS_HEIGHT,
  type NumberKey,
  NumberKeys,
} from "./const"
import {
  command,
  commandNative,
  commandNativeAsync,
  commandv,
  getProperty,
  getPropertyNumber,
  getPropertyString,
  observePropertyNumber,
  osdMessage,
} from "./mpv"
import { normalize } from "./path"

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
  "aqt,ass,gsub,idx,jss,lrc,mks,pgs,pjs,psb,rt,sbv,slt,smi,sub,sup,srt,ssa,ssf,ttxt,txt,usf,vt,vtt".split(
    ",",
  )

export function endsWith(s: string | undefined, exts: string[]) {
  if (!s?.length) {
    return false
  }
  for (const i of exts) {
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
  })
  if (r.status < 0) {
    throw new Error(`subprocess error status:${r.status} stderr:${r.stderr}`)
  }
  return r.stdout
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
            reject(result.stderr)
          } else {
            resolve(result.stdout)
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

let _scaleInit = false
let _lastH = -1
let _lastScale = 0
export function getAssScale(assHeight = DEFAULT_ASS_HEIGHT): number {
  if (!_scaleInit) {
    _scaleInit = true
    _lastH = getPropertyNumber("osd-height") || 0
    _lastScale = assHeight / _lastH
    observePropertyNumber("osd-height", (v) => {
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
      command(`loadfile "${i}" append`)
    }
    command(`playlist-play-index ${playIndex}`)
    return
  }

  const oldListIndex = oldList.indexOf(path)
  const newListIndex = list.indexOf(path)
  if (newListIndex === -1) {
    // clear and replace
    for (const i of list) {
      command(`loadfile "${i}" append`)
    }
    command(`playlist-play-index ${playIndex + oldList.length}`)
    for (let i = 0; i < oldList.length; i++) {
      command("playlist-remove 0")
    }
    return
  }
  if (JSON.stringify(oldList) === JSON.stringify(list)) {
    const oldIndex = getPropertyNumber("playlist-pos")
    if (oldIndex !== playIndex) {
      command(`playlist-play-index ${playIndex}`)
    }
    return
  }
  for (const i of list) {
    command(`loadfile "${i}" append`)
  }
  command(`playlist-play-index ${playIndex + oldCount}`)
  for (let i = 0; i < oldList.length; i++) {
    command("playlist-remove 0")
  }
}

export function loadfile(
  path: string,
  flag:
    | "replace"
    | "append"
    | "append-play"
    | "insert-next"
    | "insert-next-play"
    | "insert-at"
    | "insert-at-play" = "replace",
) {
  command(`loadfile ${path} ${flag}`)
}

export function printAndOsd(s: string, duration: number) {
  osdMessage(s, duration)
  print(s)
}
