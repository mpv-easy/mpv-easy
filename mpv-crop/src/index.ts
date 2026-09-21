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
  // extra ffmpeg args appended to the end of the ffmpeg command.
  // crop video defaults to lossless high quality (libx264 -crf 0 -preset veryslow),
  // extraArgs can override those codec settings; the last option wins.
  // only applies to video/image output, not to gif output through cut
  extraArgs: [],
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
  extraArgs: string[]
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
