import { definePlugin } from "@mpv-easy/plugin"
export * from "./translate"
export * from "./bing"

export const pluginName = "@mpv-easy/translate"

export const defaultConfig: TranslateConfig = {
  sourceLang: "",
  targetLang: "",
}

export type TranslateConfig = {
  sourceLang: string
  targetLang: string
}

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
