import { definePlugin } from "@mpv-easy/plugin"
export * from "./ui"

export const pluginName = "@mpv-easy/crop"

export const defaultConfig: CropConfig = {
  cropEventName: "crop",
  outputEventName: "output",
  cancelEventName: "cancel",
  lineColor: "FFFFFF",
  maskColor: "00000040",
  lineWidth: 4,
  lineColorHover: "00FFFF",
  outputDirectory: "",
  cropImageFormat: "webp",
  cropZIndex: 2048,
  labelFontSize: 24,
}

export type CropConfig = {
  cropEventName: string
  outputEventName: string
  cancelEventName: string
  lineColor: string
  maskColor: string
  lineWidth: number
  lineColorHover: string
  outputDirectory: string
  cropImageFormat: string
  cropZIndex: number
  labelFontSize: number
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: CropConfig
  }
}
export default definePlugin((_context, _api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {},
  destroy: () => {},
}))
