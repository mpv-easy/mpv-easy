import {
  dirname,
  getClipboard,
  isDir,
  isRemote,
  isVideo,
  youtube,
  bilibili,
  webdavList,
  twitch,
  getExtName,
  compareString,
  registerScriptMessage,
  showNotification,
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
  if (isRemote(s)) {
    if (isVideo(s)) {
      return [normalize(s)]
    }

    if (youtube.isYoutube(s)) {
      osdDuration && showNotification(`play youtube: ${s}`, osdDuration)
      return [s]
    }

    if (bilibili.isBilibili(s)) {
      osdDuration && showNotification(`play bilibili: ${s}`, osdDuration)
      return [s]
    }

    if (twitch.isTwitch(s)) {
      osdDuration && showNotification(`play twitch: ${s}`, osdDuration)
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
            .sort((a, b) => compareString(a.name, b.name))
            .map((i) => i.path)
          osdDuration && showNotification(`play jellyfin: ${s}`, osdDuration)
          return list
        } catch (e) {
          print(e)
          // maybe forget config jellyfin apiKey and username
          osdDuration &&
            showNotification(
              "Please add jellyfin apiKey and username first",
              osdDuration,
            )
        }
      } else {
        osdDuration &&
          showNotification(
            "Please add jellyfin apiKey and username first",
            osdDuration,
          )
      }
      return []
    }
    return [s]
  }

  if (isVideo(s)) {
    const c = context[autoloadName]
    const d = dirname(s)
    if (!d) {
      return []
    }
    return getPlayableList(c, s, d, getExtName(s) || "")
  }
  if (isDir(s)) {
    const c = context[autoloadName]

    // only load default type video
    return getPlayableList(c, undefined, s, undefined)
  }
  return []
}

async function fn(context: PluginContext, api: SystemApi) {
  const s = (await getClipboard()).trim().replace(/\\/g, "/")
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

export const pluginName = "@mpv-easy/clipboard-play"

export const defaultConfig: ClipboardPlayConfig = {
  eventName: "clipboard-play",
  osdDuration: 3,
}

export type ClipboardPlayConfig = {
  eventName: string
  osdDuration: number
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: ClipboardPlayConfig
  }
}

export default definePlugin((context, api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {
    const key = context[pluginName].eventName
    registerScriptMessage(key, () => {
      fn(context, api)
    })
  },
  destroy: () => {
    // removeKeyBinding(pluginName)
  },
}))
