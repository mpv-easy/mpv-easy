import "@mpv-easy/tool"
import { getConfig, plugins, saveConfig } from "./context"
import type { EnablePlugin } from "./context"
import { print } from "@mpv-easy/tool"
import { createStore } from "./store"
import { SystemApi } from "@mpv-easy/plugin"
import { pluginName } from "./main"
import { createDefaultThemeConfig } from "./mpv-easy-theme"

function main() {
  const store = createStore()
  const customConfig = getConfig()
  const { state, player } = createDefaultThemeConfig()
  // TODO: don't save these props
  customConfig[pluginName].player = player
  customConfig[pluginName].state = state
  const api: SystemApi = {
    saveConfig,
    updatePlaylist: (list, index) =>
      store.dispatch.context.setPlaylist(list, index),
    getPlaylist: () => store.getState().context[pluginName].player.playlist,
    setPath: (path: string) => store.dispatch.context.setPath(path),
    setPause: (pause: boolean) => store.dispatch.context.setPause(pause),
    getPath: () => store.getState().context[pluginName].player.path,
    store,
  }
  for (const definePlugin of plugins) {
    const plugin = definePlugin(customConfig, api)
    if (
      customConfig.enablePlugins[plugin.name as keyof EnablePlugin] &&
      plugin.create
    ) {
      plugin.create()
      print(`add plugin ${plugin.name}`)
    }
  }
}
main()
