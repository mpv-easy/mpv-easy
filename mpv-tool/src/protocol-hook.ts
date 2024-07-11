import { execSync, getOs } from "./common"
import { joinPath, writeFile } from "./mpv"
import { getTmpDir } from "./tmp"

function setProtocolHookWindows(mpvPath: string) {
  const regCode = `
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Google\\Chrome]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_CLASSES_ROOT\\mpv]
@="mpv Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\\mpv\\DefaultIcon]
@=""

[HKEY_CLASSES_ROOT\\mpv\\shell]
@=""

[HKEY_CLASSES_ROOT\\mpv\\shell\\open]
@=""

[HKEY_CLASSES_ROOT\\mpv\\shell\\open\\command]
@="C:\\\\Windows\\\\System32\\\\WindowsPowerShell\\\\v1.0\\\\powershell.exe -WindowStyle Hidden -Command \\"& {Add-Type -AssemblyName System.Web;$PARAMS=([System.Web.HTTPUtility]::UrlDecode('%1') -replace '^mpv://'); Start-Process -FilePath \\\\\\"${mpvPath}\\\\\\" -ArgumentList $PARAMS}\\""
`.trim()

  const tmpPath = joinPath(getTmpDir(), "set-protocol-hook-windows.reg")
  writeFile(tmpPath, regCode)
  execSync(["regedit.exe", "/S", tmpPath])
}

export function setProtocolHook(mpvPath: string) {
  const os = getOs()
  switch (os) {
    case "windows": {
      setProtocolHookWindows(mpvPath)
      break
    }
    default: {
      console.log(`${os} not support setProtocolHook`)
    }
  }
}
