import { definePlugin } from "@mpv-easy/plugin"
import { defaultYoutubeConfig } from "./ui"
export * from "./tool"
export * from "./ui"

export const pluginName = "@mpv-easy/youtube"

export type YoutubeConfig = {
  cookiesPath: string
  cols: number
  rows: number
  titleColor: string
  titleColorHover: string
  titleBackgroundColor: string
  loadingColor: string
  loadingBackgroundColor: string
  overlayBackgroundColor: string
  titleFontSize: number
  titleFont: string
  sidebarWidth: number
  sidebarPinned: boolean
  zIndex: number
}

export const defaultConfig: YoutubeConfig = {
  ...defaultYoutubeConfig,
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: YoutubeConfig
  }
}

export default definePlugin((_context, _api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {},
  destroy: () => {},
}))
