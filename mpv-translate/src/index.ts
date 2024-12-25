import { definePlugin } from "@mpv-easy/plugin"
import {
  defaultSubConfig,
  defaultTooltipConfig,
  SubConfig,
  TooltipConfig,
} from "./const"
export * from "./tool"
export * from "./bing"
export * from "./google"
export * from "./ui"
export * from "./const"

export const pluginName = "@mpv-easy/translate"

export const defaultConfig: TranslateConfig = {
  ...defaultSubConfig,
  ...defaultTooltipConfig,
}

export type TranslateConfig = SubConfig & TooltipConfig

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: TranslateConfig
  }
}

export default definePlugin((context, api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {},
  destroy: () => {},
}))
