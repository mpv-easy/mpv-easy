import { SystemApi, definePlugin } from "@mpv-easy/plugin"
import {
  dir,
  getMpvPlaylist,
  isYoutube,
  jellyfin,
  updatePlaylist,
} from "@mpv-easy/tool"
import { normalize } from "@mpv-easy/tool"
import {
  getPropertyString,
  isAudio,
  isHttp,
  isImage,
  isVideo,
  joinPath,
  readdir,
} from "@mpv-easy/tool"
import { getProperty, registerEvent } from "@mpv-easy/tool"

export const pluginName = "@mpv-easy/autoload"

export type AutoloadConfig = {
  image: boolean
  video: boolean
  audio: boolean
  // additionalImageExts: string,
  // additionalVideoExts: string,
  // additionalAudioExts: string,
  // ignoreHidden: boolean,
  // sameType: boolean,
  // directoryMode: 'auto' | 'recursive' | 'lazy' | 'ignore'
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: AutoloadConfig
  }
}

export const defaultConfig: AutoloadConfig = {
  image: true,
  video: true,
  audio: true,
}

export function getPlayableList(config: AutoloadConfig, dir: string) {
  if (isHttp(dir)) {
    return []
  }
  const list = readdir(dir) || []
  const videoList = list
    .filter(
      (i) =>
        (config.video && isVideo(i)) ||
        (config.audio && isAudio(i)) ||
        (config.image && isImage(i)),
    )
    .map((i) => joinPath(dir, i))
    .sort((a, b) => a.localeCompare(b))
  return videoList
}

export function autoload(
  updatePlaylist: (list: string[], playIndex: number) => void,
  getPlaylist: () => string[],
  config: AutoloadConfig,
) {
  const path = normalize(getPropertyString("path") || "")

  if (isHttp(path)) {
    if (isYoutube(path) || jellyfin.isJellyfin(path)) {
      return
    }

    const list = getMpvPlaylist()
    if (!list.includes(path)) {
      updatePlaylist([path], 0)
    }
    return
  }

  const d = dir(path)
  if (!d) {
    return
  }

  const videoList = getPlayableList(config, d)
  if (JSON.stringify(videoList) === JSON.stringify(getPlaylist())) {
    return
  }
  const currentPos = videoList.indexOf(path)
  updatePlaylist(videoList, currentPos === -1 ? 0 : currentPos)
}

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    const config = context[pluginName]
    registerEvent("start-file", () => {
      autoload(api.updatePlaylist, api.getPlaylist, config)
    })
  },
  destroy() {},
}))
