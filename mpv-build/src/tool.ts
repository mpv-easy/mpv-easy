import type { Script } from "@mpv-easy/mpsm"
import type { Repo } from "@mpv-easy/tool"
import { download as downloadRepo } from "jdl"
import { decode, File, guess } from "@easy-install/easy-archive"

// TODO: support liunx
export const PLATFORM_LIST = ["mpv", "mpv-v3", "mpv.net", "mpv-qjs"] as const
export type Platform = (typeof PLATFORM_LIST)[number]

export type State = {
  [K in keyof Store as Store[K] extends Function ? never : K]: Store[K]
}

export interface Store {
  data: Record<string, DataType>
  tableData: DataType[]
  spinning: boolean
  selectedRowKeys: string[]
  externalList: string[]
  ui: UI
  platform: Platform
  repos: Repo[]
  setData: (data: Record<string, DataType>) => void
  setTableData: (tableData: DataType[]) => void
  setSpinning: (spinning: boolean) => void
  setSelectedKeys: (selectedRowKeys: string[]) => void
  setExternalList: (externalList: string[]) => void
  setUI: (ui: UI) => void
  setPlatform: (platform: Platform) => void
  setState: (state: State) => void
  setRepos: (repos: Repo[]) => void
}

export const DEFAULT_STATE: State = {
  data: {},
  tableData: [],
  spinning: false,
  selectedRowKeys: [],
  externalList: [],
  ui: "osc",
  platform: "mpv-v3",
  repos: [],
}

export const UI_LIST = [
  {
    name: "osc",
    repo: "https://github.com/mpv-player/mpv",
    deps: ["autoload", "thumbfast"],
    requires: [],
  },
  {
    name: "uosc",
    repo: "https://github.com/tomasklaen/uosc",
    deps: ["thumbfast"],
    requires: ["uosc"],
  },
  {
    name: "mpv-easy",
    repo: "https://github.com/mpv-easy/mpv-easy",
    deps: [],
    requires: ["mpv-easy"],
  },
  {
    name: "modernx",
    repo: "https://github.com/cyl0/ModernX",
    deps: ["thumbfast", "autoload"],
    requires: ["ModernX cyl0"],
  },
  {
    name: "modernz",
    repo: "https://github.com/Samillion/ModernZ",
    deps: ["thumbfast", "autoload"],
    requires: ["ModernZ"],
  },
] as const

export type UI = (typeof UI_LIST)[number]["name"]

export const ExternalList = ["ffmpeg", "yt-dlp", "play-with"]

export interface DataType extends Script {
  key: string
  repo?: Repo
}

export function downloadBinaryFile(
  fileName: string,
  content: Uint8Array,
): void {
  const blob = new Blob([new Uint8Array(content)], {
    type: "application/octet-stream",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const name = fileName.split("/").at(-1) ?? fileName
  a.download = name
  a.href = url
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getDownloadUrl(
  user: string,
  repo: string,
  tag: string,
  file: string,
) {
  return `https://raw.githubusercontent.com/${user}/${repo}/${tag}/${file}`
}

export function getCdnFileUrl(fileName: string) {
  return getDownloadUrl("ahaoboy", "mpv-easy-cdn", "main", fileName)
}

export function getPlayWithUrl() {
  return getCdnFileUrl("mpv-easy-play-with-windows.zip")
}
export function getYtdlpUrl() {
  return getCdnFileUrl("yt-dlp.zip")
}
export function getFfmpegUrl() {
  return getCdnFileUrl("ffmpeg-windows.tar.xz")
}
export function getFfmpegV3Url() {
  return getCdnFileUrl("ffmpeg-v3-windows.tar.xz")
}

export async function downloadBinary(url: string): Promise<Uint8Array> {
  return fetch(url)
    .then((resp) => resp.arrayBuffer())
    .then((i) => new Uint8Array(i))
}

export function getScriptDownloadURL(name: string) {
  return getCdnFileUrl(`${name}.zip`)
}

export async function getScriptFiles(script: DataType): Promise<File[]> {
  if (script.repo) {
    const files = await downloadRepo(script.repo.user, script.repo.repo)
    return files
      .filter((i) => !i.isDir)
      .map(
        ({ path, buffer }) => new File(path, buffer!, undefined, false, null),
      )
  }

  const { download } = script
  if (![".js", ".lua", ".zip"].some((i) => download.endsWith(i))) {
    console.log("not support script: ", script)
    return []
  }

  const url = getScriptDownloadURL(script.name)
  const bin = await downloadBinary(url)

  const v = decode(guess(url)!, bin)!.filter((i) => !i.isDir)
  return v
}

export async function getMpvFiles(platform: Platform) {
  let mpvUrl = getCdnFileUrl("mpv-windows.tar.xz")
  if (platform === "mpv.net") {
    mpvUrl = getCdnFileUrl("mpv.net.tar.xz")
  } else if (platform === "mpv-v3") {
    getCdnFileUrl("mpv-v3-windows.tar.xz")
  } else if (platform === "mpv-qjs") {
    getCdnFileUrl("mpv-qjs.tar.xz")
  }

  const bin = await downloadBinary(mpvUrl)
  const files = decode(guess(mpvUrl)!, bin) || []
  return files
}
