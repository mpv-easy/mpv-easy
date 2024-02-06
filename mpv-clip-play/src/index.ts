import {
  addKeyBinding,
  command,
  detectCmd,
  dir,
  getClipboard,
  isDir,
  isHttp,
  isVideo,
  osdMessage,
  webdavList,
} from "@mpv-easy/tool"

import { SystemApi, definePlugin } from "@mpv-easy/plugin"
import { PluginContext } from "@mpv-easy/plugin"
import { pluginName as autoloadName, getPlayableList } from "@mpv-easy/autoload"
import { normalize } from "@mpv-easy/tool"

function getList(s: string | undefined, context: PluginContext): string[] {
  let v: string[] = []
  if (!s?.length) {
    return v
  }

  if (isHttp(s)) {
    if (isVideo(s)) {
      return [normalize(s)]
    }
    return webdavList(s)
      .map((i) => normalize(s + i.href))
      .filter((p) => isVideo(p))
  }

  if (isVideo(s)) {
    const c = context[autoloadName]
    const d = dir(s)
    if (!d) {
      return []
    }
    return getPlayableList(c, d)
  }
  if (isDir(s)) {
    const c = context[autoloadName]

    return getPlayableList(c, s)
  }
  return []
}

function fn(context: PluginContext, api: SystemApi) {
  const s = getClipboard().trim().replace(/\\/g, "/")
  let v = getList(s, context)

  if (v?.length) {
    const index = v.indexOf(s)
    if (index !== -1) {
      api.updatePlaylist(v, index)
      // command(`playlist-play-index ${index}`)
    } else {
      api.updatePlaylist(v, 0)
      // command(`playlist-play-index ${0}`)
    }
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

export default definePlugin((context, api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {
    if (!detectCmd("curl")) {
      osdMessage(`${pluginName} need curl`, 10)
      return
    }
    if (!detectCmd("pwsh")) {
      osdMessage(`${pluginName} need pwsh`, 10)
      return
    }
    const key = context[pluginName].key
    addKeyBinding(key, pluginName, () => {
      fn(context, api)
    })
  },
  destroy: () => {
    // removeKeyBinding(pluginName)
  },
}))
