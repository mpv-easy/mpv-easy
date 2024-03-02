import "@mpv-easy/tool"
import { createRender, defaultFPS } from "@mpv-easy/ui"
import React from "react"
import { definePlugin } from "@mpv-easy/plugin"
import { Easy } from "./ui"
import { Provider } from "react-redux"
import {
  defaultSaveConfigThrottle,
  defaultState,
  EasyConfig,
} from "./mpv-easy-theme"
import { Store } from "./store"
import { throttle } from "lodash-es"
import { command } from "@mpv-easy/tool"

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: EasyConfig
  }

  interface SystemApi {
    store: Store
  }
}
export { defaultConfig } from "./mpv-easy-theme"

export const pluginName = "@mpv-easy/mpv-easy-ui"
export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    command("set osc no")
    const store = api.store
    store.getState().context = context

    // TODO: Temporary attributes should not be saved
    context[pluginName].state = defaultState
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
    const fps = context[pluginName].config.fps || defaultFPS
    const render = createRender({
      fps,
      enableMouseMoveEvent:
        context[pluginName].config.enableMouseMoveEvent ?? true,
    })
    render(
      <Provider store={store}>
        <Easy />
      </Provider>,
    )
  },
}))
