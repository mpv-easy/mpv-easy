import { definePlugin } from "@mpv-easy/plugin"
import {
  alphaNumSort,
  commandNative,
  isAudio,
  isImage,
  isVideo,
  joinPath,
  readdir,
  unregisterEvent,
} from "@mpv-easy/tool"
import {
  addKeyBinding,
  command,
  getProperty,
  getPropertyNative,
  getPropertyNumber,
  registerEvent,
  removeKeyBinding,
  replacePlaylist,
} from "@mpv-easy/tool"

export const pluginName = "@mpv-easy/autoload"

export type AutoloadConfig = {
  // disabled: boolean,
  // images: boolean,
  // videos: boolean,
  // audio: boolean,
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
  // disabled: false,
  // images: true,
  // videos: true,
}

export function autoload() {
  const path = getProperty("path") || ""

  const dir = path?.replace("\\", "/").split("/").slice(0, -1).join("/")
  const list = readdir(dir) || []
  const videoList = alphaNumSort(
    list
      .filter((i) => isVideo(i) || isAudio(i) || isImage(i))
      .map((i) => joinPath(dir, i)),
  )
  const oldCount = getPropertyNumber("playlist-count", 1) || 1
  const playlistPos = getPropertyNumber("playlist-pos", 0) || 0
  const currentPos = videoList.indexOf(path)

  for (let i = oldCount - 1; i >= 0; i--) {
    if (i === playlistPos) {
      continue
    }
    command(`playlist-remove ${i}`)
  }

  for (const i of videoList) {
    if (i === path) {
      continue
    }
    command(`loadfile ${i} append`)
  }

  if (currentPos > 0) {
    commandNative(["playlist-move", 0, currentPos + 1])
  }
}
export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    const config = context[pluginName]
    registerEvent("start-file", autoload)
  },
  destroy() {
    unregisterEvent(autoload)
  },
}))
