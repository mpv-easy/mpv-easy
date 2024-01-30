export interface PluginContext {}

export interface SystemApi {
  saveConfig: (config: PluginContext) => void
}

export type Plugin = {
  name: string
} & Partial<{
  create: () => void
  destroy: () => void
}>

export function definePlugin(
  plugin: (context: PluginContext, system: SystemApi) => Plugin,
) {
  return plugin
}
