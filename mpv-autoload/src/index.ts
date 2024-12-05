import { SystemApi, definePlugin } from "@mpv-easy/plugin"
import {
  AudioTypes,
  compareString,
  dirname,
  getExtName,
  getMpvPlaylist,
  ImageTypes,
  isYtdlp,
  VideoTypes,
} from "@mpv-easy/tool"
import { normalize } from "@mpv-easy/tool"
import {
  getPropertyString,
  isAudio,
  isRemote,
  isImage,
  isVideo,
  joinPath,
  readdir,
} from "@mpv-easy/tool"
import { registerEvent } from "@mpv-easy/tool"

export const pluginName = "@mpv-easy/autoload"

export type AutoloadConfig = {
  image: boolean
  video: boolean
  audio: boolean
  maxSize: number
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
  maxSize: 64,
}

/**
 *
 * @param config AutoloadConfig
 * @param searchDir dir path
 * @param extName: undefined match default rules, '' match all
 * @returns
 */
export function getPlayableList(
  config: AutoloadConfig,
  currentPath: string | undefined,
  searchDir: string,
  extName: string | undefined = undefined,
) {
  if (isRemote(searchDir)) {
    return []
  }
  const list = readdir(searchDir, "files") || []
  const videoList = list
    .filter(
      (i) =>
        (config.video &&
          isVideo(
            i,
            extName !== undefined ? [extName, ...VideoTypes] : VideoTypes,
          )) ||
        (config.audio &&
          isAudio(
            i,
            extName !== undefined ? [extName, ...AudioTypes] : AudioTypes,
          )) ||
        (config.image &&
          isImage(
            i,
            extName !== undefined ? [extName, ...ImageTypes] : ImageTypes,
          )),
    )
    .map((i) => joinPath(searchDir, i))
    .sort((a, b) => compareString(a, b))
  if (videoList.length > config.maxSize) {
    print(`load too many videos(${videoList.length})`)
  }
  const startIndex = currentPath ? videoList.indexOf(currentPath) : -1

  if (startIndex === -1) {
    return videoList.slice(0, config.maxSize)
  }

  const st = Math.max(startIndex - (config.maxSize >> 1), 0)
  const ed = st + config.maxSize
  return videoList.slice(st, ed)
}

export function autoload(
  updatePlaylist: (list: string[], playIndex: number) => void,
  getPlaylist: () => string[],
  config: AutoloadConfig,
) {
  const path = normalize(getPropertyString("path") || "")

  if (isRemote(path)) {
    if (isYtdlp(path)) {
      return
    }

    const list = getMpvPlaylist()
    if (!list.includes(path)) {
      updatePlaylist([path], 0)
    }
    return
  }

  const d = dirname(path)
  if (!d) {
    return
  }

  const ext = getExtName(path)
  const videoList = getPlayableList(config, path, d, ext || "")
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
