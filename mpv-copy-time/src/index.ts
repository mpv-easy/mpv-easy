import {
  addKeyBinding,
  getClipboard,
  getPropertyNumber,
  isHttp,
  isVideo,
  osdMessage,
  readdir,
  removeKeyBinding,
  replacePlaylist,
  setClipboard,
  webdavList,
} from "@mpv-easy/tool"

import { definePlugin } from "@mpv-easy/plugin"

function fn() {
  const s = getClipboard().trim().replace(/\\/g, "/")
  let v: undefined | string[]
  if (s?.length > 0) {
    if (isVideo(s)) {
      v = [s]
    } else if (isHttp(s)) {
      v = webdavList(s)
        .map((i) => s + i.href)
        .filter((p) => isVideo(p))
    } else {
      const list = readdir(s)
      if (list?.length) {
        v = list.map((i) => `${s}\\${i}`.replace(/\\/g, "/"))
      }
    }
  }
  if (v?.length) {
    replacePlaylist(v, 0)
  }
}

export const pluginName = "@mpv-easy/copy-time"

export const defaultConfig: copyTimeConfig = {
  key: "ctrl+c",
}

function divmod(a: number, b: number) {
  return [a / b, a % b] as const
}

function copyTime() {
  const time_pos = getPropertyNumber("time-pos") || 0
  const [minutes, remainder] = divmod(time_pos, 60)
  const [hours, mins] = divmod(minutes, 60)
  const seconds = Math.floor(remainder)
  const milliseconds = Math.floor((remainder - seconds) * 1000)
  const time = `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
    .toString()
    .padStart(3, "0")}`

  if (setClipboard(time)) {
    osdMessage(`Copied to Clipboard: ${time}`)
  } else {
    osdMessage("Failed to copy time to clipboard")
  }
}

export type copyTimeConfig = {
  key: string
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: copyTimeConfig
  }
}

export default definePlugin((context) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {
    const key = context[pluginName]?.key ?? defaultConfig.key
    addKeyBinding(key, pluginName, copyTime)
  },
  destroy: () => {
    removeKeyBinding(pluginName)
  },
}))
