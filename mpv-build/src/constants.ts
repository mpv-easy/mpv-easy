import type { State } from "./types"

export const PLATFORM_LIST = ["mpv", "mpv-v3", "mpv.net", "mpv-qjs"] as const

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

export const ExternalList = ["ffmpeg", "yt-dlp", "deno", "play-with"]

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

export function getDenoUrl() {
  return getCdnFileUrl("deno.tar.xz")
}

// Layout constants
export const TITLE_WIDTH = 150
export const ITEM_WIDTH = 150
export const NAME_WIDTH = 250
