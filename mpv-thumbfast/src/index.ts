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

export const pluginName = "@mpv-easy/thumbfast"

export type ThumbfastConfig = {}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: ThumbfastConfig
  }
}

export const defaultConfig: ThumbfastConfig = {}

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    throw new Error("TODO")
  },
  destroy() { },
}))
