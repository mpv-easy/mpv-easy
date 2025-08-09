import { execSync } from "../common"
import { ConfigDir } from "../const"
import { getScriptDir, joinPath } from "../mpv"
import { pwshExecCode } from "./shell"

export type MouseCursorType = "Arrow" | "Hand"
let cursorBackup: Record<MouseCursorType, string>
export function getMouseStyle(): Record<MouseCursorType, string> {
  if (cursorBackup) return cursorBackup
  const s = execSync([
    "powershell",
    "-c",
    'Get-ItemProperty -Path "HKCU:\\Control Panel\\Cursors"',
  ]).trim()

  cursorBackup = {
    Arrow: "",
    Hand: "",
  }
  for (const line of s.split("\n")) {
    const index = line.indexOf(":")
    const name = line.slice(0, index).trim()
    const value = line.slice(index + 1).trim()
    if (name === "Arrow") {
      cursorBackup.Arrow = value
    } else if (name === "Hand") {
      cursorBackup.Hand = value
    }
  }

  return cursorBackup
}

let backupMouseStyle: Record<MouseCursorType, string>
export function setMouseStyle(cursor: MouseCursorType) {
  if (!backupMouseStyle) {
    backupMouseStyle = getMouseStyle()
  }
  const s = backupMouseStyle[cursor]
  if (!s.length) {
    return
  }
  const code = `Set-ItemProperty -Path 'HKCU:\\Control Panel\\Cursors' -Name 'Arrow' -Value '${s}';
Add-Type -TypeDefinition @'
public class SysParamsInfo {
    [System.Runtime.InteropServices.DllImport(\"user32.dll\", EntryPoint = \"SystemParametersInfo\")]
    public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, uint pvParam, uint fWinIni);

    const int SPI_SETCURSORS = 0x0057;
    const int SPIF_UPDATEINIFILE = 0x01;
    const int SPIF_SENDCHANGE = 0x02;

    public static void CursorHasChanged() {
        SystemParametersInfo(SPI_SETCURSORS, 0, 0, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);
    }
}
'@
[SysParamsInfo]::CursorHasChanged()`
  const scriptName = "mpv_easy_tool_set_mouse_style.ps1"
  const scriptPath = joinPath(getScriptDir(), ConfigDir, scriptName)
  pwshExecCode(scriptPath, code)
}
