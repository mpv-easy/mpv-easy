import { getConfig, plugins, saveConfig } from "./context"
import type { EnablePlugin } from "./context"
import { print, registerEvent } from "@mpv-easy/tool"
import type { SystemApi } from "@mpv-easy/plugin"
import { pluginName } from "./main"
import { createDefaultThemeConfig } from "./mpv-easy-theme"
import { getSnapshot, dispatch, store } from "./models"

function main() {
  const customConfig = getConfig()
  const { state, player } = createDefaultThemeConfig()
  // TODO: don't save these props
  customConfig[pluginName].player = player
  customConfig[pluginName].state = state
  const api: SystemApi = {
    saveConfig,
    updatePlaylist: (list, index) => dispatch.setPlaylist(list, index),
    getPlaylist: () => getSnapshot()[pluginName].player.playlist,
    setPath: (path: string) => dispatch.setPath(path),
    setPause: (pause: boolean) => dispatch.setPause(pause),
    getPath: () => getSnapshot()[pluginName].player.path,
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

  registerEvent("shutdown", () => {
    for (const definePlugin of plugins) {
      const plugin = definePlugin(customConfig, api)
      if (
        customConfig.enablePlugins[plugin.name as keyof EnablePlugin] &&
        plugin.destroy
      ) {
        plugin.destroy()
        print(`destroy plugin ${plugin.name}`)
      }
    }
  })
}
main()
