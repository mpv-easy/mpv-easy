import { execSync, getOs } from "../common"
import { joinPath, getScriptConfigDir } from "../mpv"
import decodeUriComponent from "decode-uri-component"
import { getFileName } from "../path"

export const defaultBinDirName = "bin"
export const defaultBinDirPath = joinPath(
  getScriptConfigDir(),
  defaultBinDirName,
)
export const defaultMacExeName = "rs-ext-macos"
export const defaultWinExeName = "rs-ext-windows"
export const defaultLinuxExeName = "rs-ext-linux"

export function getRsExtExePath() {
  const os = getOs()
  switch (os) {
    case "darwin": {
      return joinPath(defaultBinDirPath, defaultMacExeName)
    }
    case "linux": {
      return joinPath(defaultBinDirPath, defaultLinuxExeName)
    }
    case "windows": {
      return joinPath(defaultBinDirPath, defaultWinExeName)
    }
    default: {
      throw new Error("rs-ext not support os: " + os)
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
    execSync([exe, "clipboard", "set", JSON.stringify(text)])
    return true
  } catch {
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
  } catch {
    return false
  }
}

export type FetchParams = {
  url: string
  headers: Record<string, string>
  body: string
}
export function fetch(params: FetchParams, exe = getRsExtExePath()) {
  return execSync([exe, "fetch", JSON.stringify(params)])
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
