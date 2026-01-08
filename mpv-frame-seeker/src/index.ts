import { definePlugin } from "@mpv-easy/plugin"
export * from "./ui"

export const pluginName = "@mpv-easy/frame-seeker"

export const defaultConfig: FrameConfig = {
  color: "FFFFFFFF",
  activeColor: "FF00FF00",
  borderSize: 2,
  frames: 120,
  bottom: 100,
  radius: 100,
  zIndex: 1000,
  ui: true,
  frameSeekerEventName: "frame-seeker",
}

export type FrameConfig = {
  color: string
  activeColor: string
  borderSize: number
  frames: number
  bottom: number
  radius: number
  zIndex: number
  ui: boolean
  frameSeekerEventName: string
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: FrameConfig
  }
}
export default definePlugin((_context, _api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {},
  destroy: () => {},
}))
