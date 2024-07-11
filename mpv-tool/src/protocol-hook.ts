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
  execSync(["regedit.exe", "/S", tmpPath])
}

export function setProtocolHook(mpvPath: string, mpvPlayWithPath: string) {
  const os = getOs()
  switch (os) {
    case "windows": {
      setProtocolHookWindows(mpvPath, mpvPlayWithPath)
      break
    }
    default: {
      console.log(`${os} not support setProtocolHook`)
    }
  }
}
