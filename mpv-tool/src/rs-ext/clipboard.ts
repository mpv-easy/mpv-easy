import { execAsync, getOs } from "../common"
import { existsSync } from "../fs"
import { error } from "../mpv"
import { getRsExtExePath } from "./share"

export async function getClipboard(exe = getRsExtExePath()): Promise<string> {
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        try {
          const s = await execAsync([
            "powershell",
            "-c",
            "Add-Type -AssemblyName System.Windows.Forms;[System.Windows.Forms.Clipboard]::GetText()",
          ])
          return s
        } catch (e) {
          error(e)
          return ""
        }
      }
      case "linux":
      case "darwin":
      case "android": {
        return ""
      }
    }
  }

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
