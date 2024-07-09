import {
  addKeyBinding,
  dir,
  getClipboard,
  printAndOsd,
  isDir,
  isHttp,
  isVideo,
  isYoutube,
  webdavList,
} from "@mpv-easy/tool"

import { type SystemApi, definePlugin } from "@mpv-easy/plugin"
import type { PluginContext } from "@mpv-easy/plugin"
import { pluginName as autoloadName, getPlayableList } from "@mpv-easy/autoload"
import { normalize, jellyfin } from "@mpv-easy/tool"
import { pluginName as jellyfinName } from "@mpv-easy/jellyfin"

function getList(s: string | undefined, context: PluginContext): string[] {
  const v: string[] = []
  if (!s?.length) {
    return v
  }
  const osdDuration = context[pluginName].osdDuration
  if (isHttp(s)) {
    if (isVideo(s)) {
      return [normalize(s)]
    }

    if (isYoutube(s)) {
      osdDuration && printAndOsd(`play youtube: ${s}`, osdDuration)
      return [s]
    }

    try {
      return webdavList(s)
        .map((i) => normalize(s + i))
        .filter((p) => isVideo(p))
    } catch (e) {
      print("webdav error: ", e)
    }

    if (jellyfin.isJellyfin(s)) {
      const cfg = context[jellyfinName]
      if (cfg.apiKey?.length && cfg.userName?.length) {
        try {
          const list = jellyfin
            .getPlayableListFromUrl(s, cfg.apiKey, cfg.userName)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((i) => i.path)
          osdDuration && printAndOsd(`play jellyfin: ${s}`, osdDuration)
          return list
        } catch (e) {
          print(e)
          // maybe forget config jellyfin apiKey and username
          osdDuration && printAndOsd("Please add jellyfin apiKey and username first", osdDuration)
        }
      } else {
        osdDuration && printAndOsd("Please add jellyfin apiKey and username first", osdDuration)
      }
      return []
    }
    return [s]
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
  const v = getList(s, context)

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
  osdDuration: 3,
}

export type ClipPlayConfig = {
  key: string
  osdDuration: number
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
    const key = context[pluginName].key
    addKeyBinding(key, pluginName, () => {
      fn(context, api)
    })
  },
  destroy: () => {
    // removeKeyBinding(pluginName)
  },
}))
