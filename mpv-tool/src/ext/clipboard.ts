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
      const s = pwshExecCode(scriptPath, code, outputPath)
      return s
    }

    default: {
      throw new Error("getClipboard error")
    }
  }
}
