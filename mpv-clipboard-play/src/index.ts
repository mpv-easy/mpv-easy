import {
  dirname,
  getClipboard,
  isDir,
  isRemote,
  isPlayable,
  youtube,
  bilibili,
  webdavList,
  twitch,
  getExtName,
  compareString,
  registerScriptMessage,
  showNotification,
  isSubtitle,
  subAdd,
} from "@mpv-easy/tool"
import { type SystemApi, definePlugin } from "@mpv-easy/plugin"
import type { PluginContext } from "@mpv-easy/plugin"
import { pluginName as autoloadName, getPlayableList } from "@mpv-easy/autoload"
import { normalize, jellyfin } from "@mpv-easy/tool"
import { pluginName as jellyfinName } from "@mpv-easy/jellyfin"

export type ClipboardPlayContext = Pick<
  PluginContext,
  typeof autoloadName | typeof jellyfinName | typeof pluginName
>

function getList(
  s: string | undefined,
  context: ClipboardPlayContext,
): string[] {
  const v: string[] = []
  if (!s?.length) {
    return v
  }
  const osdDuration = context[pluginName].osdDuration
  if (isRemote(s)) {
    if (isPlayable(s)) {
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
      const origin = new URL(s).origin
      return webdavList(s)
        .map((i) =>
          normalize(
            origin +
              i
                .split("/")
                .map((k) => encodeURIComponent(k))
                .join("/"),
          ),
        )
        .filter((p) => isPlayable(p))
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

  if (isPlayable(s)) {
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

export async function clipboardPlay(
  context: ClipboardPlayContext,
  updatePlaylist: (list: string[], playIndex: number) => void,
  txt: string,
) {
  // Windows may add double quotes when copying the path
  const lines = txt
    .split("\n")
    .map((s) =>
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
        ? s.slice(1, -1).trim()
        : s.trim(),
    )

  for (const s of lines) {
    if (!s.length) {
      continue
    }
    if (isSubtitle(s)) {
      subAdd(s, "cached")
      return
    }
    const v = getList(s, context)
    if (v?.length) {
      const index = v.indexOf(s)
      if (index !== -1) {
        updatePlaylist(v, index)
      } else {
        updatePlaylist(v, 0)
      }
    }
  }
}

export const pluginName = "@mpv-easy/clipboard-play"

export const defaultConfig: ClipboardPlayConfig = {
  clipboardPlayEventName: "clipboard-play",
  osdDuration: 3,
}

export type ClipboardPlayConfig = {
  clipboardPlayEventName: string
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
    const key = context[pluginName].clipboardPlayEventName
    registerScriptMessage(key, async () => {
      const txt = (await getClipboard()).trim().replace(/\\/g, "/")
      clipboardPlay(context, api.updatePlaylist, txt)
    })
  },
  destroy: () => {
    // removeKeyBinding(pluginName)
  },
}))
