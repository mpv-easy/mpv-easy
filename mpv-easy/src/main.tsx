import { command } from "@mpv-easy/tool"
import { render } from "@mpv-easy/ui"
import React from "react"
import { definePlugin } from "@mpv-easy/plugin"
import { Easy } from "./ui"
import { Provider } from "react-redux"
import { defaultSaveConfigThrottle, easyConfig } from "./mpv-easy-theme"
import { createStore } from "./store"
import { throttle } from "lodash-es"

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: easyConfig
  }
}
export { defaultConfig } from "./mpv-easy-theme"

export const pluginName = "@mpv-easy/mpv-easy-ui"

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    command("set osc no")
    command("set window-dragging no")

    const store = createStore()
    store.getState().context = context

    // TODO: Temporary attributes should not be saved
    context[pluginName].state.tooltipHide = true
    store.subscribe(
      throttle(
        () => {
          const state = store.getState().context
          api.saveConfig(state)
        },
        defaultSaveConfigThrottle,
        {
          leading: false,
          trailing: true,
        },
      ),
    )

    render(
      <Provider store={store}>
        <Easy />
      </Provider>,
    )
  },
}))
