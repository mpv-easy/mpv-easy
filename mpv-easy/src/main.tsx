import { command } from "@mpv-easy/tool"
import { createRender } from "@mpv-easy/ui"
import React from "react"
import { definePlugin } from "@mpv-easy/plugin"
import { Easy } from "./ui"
import { Provider } from "react-redux"
import {
  defaultSaveConfigThrottle,
  defaultState,
  EasyConfig,
} from "./mpv-easy-theme"
import { createStore, Store } from "./store"
import { throttle } from "lodash-es"

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
command("set osc no")
command("set window-dragging no")
export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
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
    const render = createRender({
      rerenderThrottle: context[pluginName].render.rerenderThrottle ?? 100,
      enableMouseMoveEvent:
        context[pluginName].render.enableMouseMoveEvent ?? true,
    })
    render(
      <Provider store={store}>
        <Easy />
      </Provider>,
    )
  },
}))
