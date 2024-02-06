import { getOs, Windows } from "../common"
import { ConfigDir } from "../const"
import { getScriptDir, joinPath } from "../mpv"
import { pwshExecCode } from "./shell"

export function setClipboard(text: string): boolean {
  const scriptName = "mpv_easy_tool_clipboard.ps1"
  const scriptPath = joinPath(getScriptDir(), ConfigDir, scriptName)

  const platform = getOs()
  switch (platform) {
    case Windows:
      {
        const code = `
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
Set-Clipboard "${text}"
`
        pwshExecCode(scriptPath, code)
      }

      return true
    default: {
      throw new Error("setClipboard error")
    }
  }
}

export function setClipboardImage(path: string): boolean {
  const scriptName = "mpv_easy_tool_clipboard_image.ps1"
  const scriptPath = joinPath(getScriptDir(), ConfigDir, scriptName)

  const platform = getOs()
  switch (platform) {
    case Windows:
      {
        const code = `
Add-Type -AssemblyName System.Windows.Forms

$imagePath = "${path}"

$image = [System.Drawing.Image]::FromFile($imagePath)

[System.Windows.Forms.Clipboard]::SetImage($image)

$image.Dispose()

`
        pwshExecCode(scriptPath, code, undefined, "pwsh")
      }

      return true
    default: {
      throw new Error("setClipboard error")
    }
  }
}

export function getClipboard(): string {
  const scriptName = "mpv_easy_tool_clipboard.ps1"
  const outputName = "mpv_easy_tool_getClipboard.txt"
  const outputPath = joinPath(getScriptDir(), ConfigDir, outputName)
  const scriptPath = joinPath(getScriptDir(), ConfigDir, scriptName)
  const platform = getOs()
  switch (platform) {
    case Windows: {
      const code = `
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
$commandOutput = Get-Clipboard
$commandOutput | Set-Content -Path "${outputPath}"
`
      const s = pwshExecCode(scriptPath, code, outputPath, "pwsh")
      return s
    }

    default: {
      throw new Error("getClipboard error")
    }
  }
}
