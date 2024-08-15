import { getOs } from "./common"
import { joinPath } from "./mpv"
import { getDefaultBinDirPath } from "./rs-ext"

const defaultMacExeName = "mpv-easy-play-with-macos"
const defaultWindowsExeName = "mpv-easy-play-with-windows.exe"
const defaultAndroidExeName = "mpv-easy-play-with-android"
const defaultLinuxExeName = "mpv-easy-play-with-linux"

export function getPlayWithExePath() {
  const os = getOs()
  switch (os) {
    case "darwin": {
      return joinPath(getDefaultBinDirPath(), defaultMacExeName)
    }
    case "linux": {
      return joinPath(getDefaultBinDirPath(), defaultLinuxExeName)
    }
    case "windows": {
      return joinPath(getDefaultBinDirPath(), defaultWindowsExeName).replaceAll(
        "/",
        "\\\\",
      )
    }
    case "android": {
      return joinPath(getDefaultBinDirPath(), defaultAndroidExeName)
    }
    default: {
      throw new Error(`mpv-easy-ext not support os: ${os}`)
    }
  }
}
