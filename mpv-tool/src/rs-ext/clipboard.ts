// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { Buffer } from "buffer"
import { execSync } from "../common"
import { error } from "../mpv"
import { getRsExtExePath } from "./share"

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
