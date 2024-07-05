import { definePlugin } from "@mpv-easy/plugin"
export const pluginName = "@mpv-easy/jellyfin"

export const defaultConfig: JellyfinConfig = {
  userName: "",
  apiKey: "",
}

export type JellyfinConfig = {
  userName: string
  apiKey: string
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: JellyfinConfig
  }
}

export default definePlugin((context, api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {},
  destroy: () => {
    // removeKeyBinding(pluginName)
  },
}))
