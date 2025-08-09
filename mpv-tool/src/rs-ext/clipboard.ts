import { execAsync, getOs } from "../common"
import { existsSync } from "../fs"
import { randomId } from "../math"
import { error, joinPath, writeFile } from "../mpv"
import { normalize } from "../path"
import { getTmpDir } from "../tmp"
import { getRsExtExePath } from "./share"

export async function getClipboard(exe = getRsExtExePath()): Promise<string> {
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        try {
          const s = await execAsync([
            "powershell",
            "-c",
            "Add-Type -AssemblyName System.Windows.Forms; if ([System.Windows.Forms.Clipboard]::ContainsText()) { [System.Windows.Forms.Clipboard]::GetText() } else { ([System.Windows.Forms.Clipboard]::GetFileDropList()) -join [Environment]::NewLine }",
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
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        try {
          const tmpPath = joinPath(getTmpDir(), `${randomId()}.tmp.txt`)
          writeFile(tmpPath, text)
          const cmd = [
            "powershell",
            "-c",
            `Get-Content -Path "${tmpPath}" -Raw | Set-Clipboard`,
          ]
          await execAsync(cmd)
          console.log(cmd.join(" "))
          return true
        } catch (e) {
          error(e)
          return false
        }
      }
      case "linux":
      case "darwin":
      case "android": {
        return false
      }
    }
  }
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
  if (!existsSync(exe)) {
    switch (getOs()) {
      case "windows": {
        try {
          const cmd = [
            "powershell",
            "-c",
            `Get-ChildItem "${normalize(path)}" | Set-Clipboard`,
          ]
          const _r = await execAsync(cmd)
          return true
        } catch (e) {
          error(e)
          return false
        }
      }
      case "linux":
      case "darwin":
      case "android": {
        return false
      }
    }
  }

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
