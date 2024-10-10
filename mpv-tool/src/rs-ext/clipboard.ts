// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { Buffer } from "buffer"
import { execAsync } from "../common"
import { error } from "../mpv"
import { getRsExtExePath } from "./share"

export async function getClipboard(exe = getRsExtExePath()): Promise<string> {
  const s = await execAsync([exe, "clipboard", "get"])
  const text = JSON.parse(s)
  return text
}

export async function setClipboard(
  text: string,
  exe = getRsExtExePath(),
): Promise<boolean> {
  try {
    const base64 = Buffer.from(text).toString("base64")
    await execAsync([exe, "clipboard", "set", base64])
    return true
  } catch (e) {
    error(e)
    return false
  }
}

export async function setClipboardImage(
  path: string,
  exe = getRsExtExePath(),
): Promise<boolean> {
  try {
    const base64 = Buffer.from(path).toString("base64")
    const cmd = [exe, "clipboard", "set-image", base64]
    await execAsync(cmd)
    return true
  } catch (e) {
    error(e)
    return false
  }
}
