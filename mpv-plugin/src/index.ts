export interface PluginContext {}

export interface SystemApi {
  saveConfig: (config: PluginContext) => void
  updatePlaylist: (list: string[], playIndex: number) => void
  getPlaylist: () => string[]
  setPause: (pause: boolean) => void
  setPath: (path: string) => void
  getPath: () => string
}

export type Plugin = {
  name: string
} & Partial<{
  create: () => void
  destroy: () => void
}>

export function definePlugin<T = undefined>(
  plugin: (context: PluginContext, system: SystemApi, store?: T) => Plugin,
) {
  return plugin
}
