import { execSync, getOs } from "./common"
import { joinPath, writeFile } from "./mpv"
import { getTmpDir } from "./tmp"

function setProtocolHookWindows(mpvPath: string, mpvPlayWithPath: string) {
  const regCode = `
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Google\\Chrome]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_CLASSES_ROOT\\mpv-easy]
@="mpv-easy"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\\mpv-easy\\DefaultIcon]
@=""

[HKEY_CLASSES_ROOT\\mpv-easy\\shell]
@=""

[HKEY_CLASSES_ROOT\\mpv-easy\\shell\\open]
@=""

[HKEY_CLASSES_ROOT\\mpv-easy\\shell\\open\\command]
@="${mpvPlayWithPath} ${mpvPath} %1"

`.trim()

  const tmpPath = joinPath(getTmpDir(), "set-protocol-hook-windows.reg")
  writeFile(tmpPath, regCode)
  const cmd = ["cmd", "/c", `regedit.exe /S ${tmpPath.replaceAll("/", "\\")}`]
  execSync(cmd)
}

export function setProtocolHook(mpvPath: string, mpvPlayWithPath: string) {
  const os = getOs()
  switch (os) {
    case "windows": {
      try {
        setProtocolHookWindows(mpvPath, mpvPlayWithPath)
        return true
      } catch (e) {
        console.log(`windows setProtocolHook error: ${e}`)
      }
    }
    default: {
      console.log(`${os} not support setProtocolHook`)
    }
  }
}
