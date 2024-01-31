import "@mpv-easy/tool"
import { getConfig, api, plugins } from "./context"
import type { EnablePlugin } from "./context"
import { print } from "@mpv-easy/tool"

const customConfig = getConfig()

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
