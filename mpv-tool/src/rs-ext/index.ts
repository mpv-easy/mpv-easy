import { execSync, getOs } from "../common"
import { joinPath, getScriptConfigDir, error } from "../mpv"
import decodeUriComponent from "decode-uri-component"
import { getFileName } from "../path"
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { Buffer } from "buffer"

export const defaultBinDirName = "mpv-easy-ext"
export const getDefaultBinDirPath = () =>
  joinPath(getScriptConfigDir(), defaultBinDirName)

export const defaultMacExeName = "mpv-easy-ext-macos"
export const defaultWindowsExeName = "mpv-easy-ext-windows"
export const defaultAndroidExeName = "mpv-easy-ext-android"
export const defaultLinuxExeName = "mpv-easy-ext-linux"

export function getRsExtExePath() {
  // TODO: custom path
  // const op = {
  //   "mpv-easy-ext": ""
  // }
  // readOptions(op)

  // const config_path = op['mpv-easy-ext'] ?? ""
  // if (config_path.length && existsSync(config_path)) {
  //   return config_path
  // }

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

export function mkdir(dir: string, exe = getRsExtExePath()) {
  execSync([exe, "fs", "mkdir", JSON.stringify(dir)])
}

export function getClipboard(exe = getRsExtExePath()): string {
  const s = execSync([exe, "clipboard", "get"])
  const text = JSON.parse(s)
  return text
}

export function setClipboard(text: string, exe = getRsExtExePath()) {
  try {
    const base64 = Buffer.from(text).toString("base64")
    execSync([exe, "clipboard", "set", JSON.stringify(base64)])
    return true
  } catch (e) {
    error(e)
    return false
  }
}

export function setClipboardImage(
  path: string,
  exe = getRsExtExePath(),
): boolean {
  try {
    execSync([exe, "clipboard", "set-image", JSON.stringify(path)])
    return true
  } catch (e) {
    error(e)
    return false
  }
}

export type FetchParams = {
  url: string
  headers: Record<string, string>
  body: string
}

export type FetchResponse = {
  status: number
  text: string
}
export function fetch(url: string, exe = getRsExtExePath()): FetchResponse {
  return JSON.parse(execSync([exe, "fetch", JSON.stringify(url)]))
}

export function webdavList(url: string, exe = getRsExtExePath()) {
  const s = execSync([exe, "webdav", "list", JSON.stringify(url)])
  const status = JSON.parse(s)
  const response = status.response as { href: string }[]
  const list = response
    .map((i) => decodeUriComponent(i.href))
    .filter((i) => !!getFileName(i)?.length)
  return list
}
