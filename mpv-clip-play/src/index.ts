import {
  addKeyBinding,
  getClipboard,
  isHttp,
  isVideo,
  readdir,
  removeKeyBinding,
  replacePlaylist,
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

export const pluginName = "@mpv-easy/clip-play"

export const defaultConfig: ClipPlayConfig = {
  key: "ctrl+v",
}

export type ClipPlayConfig = {
  key: string
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: ClipPlayConfig
  }
}

export default definePlugin((context) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {
    const key = context[pluginName].key
    addKeyBinding(key, pluginName, fn)
  },
  destroy: () => {
    removeKeyBinding(pluginName)
  },
}))
