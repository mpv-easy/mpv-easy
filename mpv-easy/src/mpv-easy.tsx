import "@mpv-easy/tool"
import { getConfig, plugins, saveConfig } from "./context"
import type { EnablePlugin } from "./context"
import { print } from "@mpv-easy/tool"
import { createStore } from "./store"
import { SystemApi } from "@mpv-easy/plugin"

function main() {
  const store = createStore()
  const customConfig = getConfig()
  const api: SystemApi = {
    saveConfig,
    updatePlaylist: (list) => store.dispatch.context.setPlaylist(list),
    store,
  }
  plugins.forEach((definePlugin) => {
    const plugin = definePlugin(customConfig, api)
    if (
      customConfig.enablePlugins[plugin.name as keyof EnablePlugin] &&
      plugin.create
    ) {
      plugin.create()
      print("add plugin ", plugin.name)
    }
  })
}
main()
// setTimeout(main)
