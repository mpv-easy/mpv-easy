import { getOs } from "../common"
import { joinPath, getScriptConfigDir } from "../mpv"

export const defaultBinDirName = "mpv-easy-ext"
export const getDefaultBinDirPath = () =>
  joinPath(getScriptConfigDir(), defaultBinDirName)

const defaultMacExeName = "mpv-easy-ext-macos"
const defaultWindowsExeName = "mpv-easy-ext-windows"
const defaultAndroidExeName = "mpv-easy-ext-android"
const defaultLinuxExeName = "mpv-easy-ext-linux"

export function getRsExtExePath() {
  // TODO: custom path
  // const op = {
  //   "mpv-easy-ext": ""
  // }
  // readOptions(op)

  // const config_path = op['mpv-easy-ext'] ?? ""
  // if (config_path.length && existsSync(config_path)) {
  //   return config_path
  // }

  const os = getOs()
  switch (os) {
    case "darwin": {
      return joinPath(getDefaultBinDirPath(), defaultMacExeName)
    }
    case "linux": {
      return joinPath(getDefaultBinDirPath(), defaultLinuxExeName)
    }
    case "windows": {
      return joinPath(getDefaultBinDirPath(), defaultWindowsExeName)
    }
    case "android": {
      return joinPath(getDefaultBinDirPath(), defaultAndroidExeName)
    }
    default: {
      throw new Error(`mpv-easy-ext not support os: ${os}`)
    }
  }
}
