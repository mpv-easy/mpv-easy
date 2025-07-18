import { DefaultFps, RenderConfig, createRender } from "@mpv-easy/react"
import React from "react"
import { definePlugin } from "@mpv-easy/plugin"
import { Easy } from "./ui"
import {
  defaultSaveConfigThrottle,
  defaultState,
  type EasyConfig,
} from "./mpv-easy-theme"
import { syncPlayer, type Store } from "./models"
import throttle from "lodash-es/throttle"
export * from "./const"
import { pluginName } from "./const"
declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: EasyConfig

    renderConfig: Partial<RenderConfig>
  }

  interface SystemApi {
    store: Store
  }
}

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    const store = api.store
    store.setState(context)

    // TODO: Temporary attributes should not be saved
    context[pluginName].state = defaultState
    store.subscribe(
      throttle(() => {
        const state = store.getState()
        api.saveConfig(state)
      }, defaultSaveConfigThrottle),
    )
    const fps = context.renderConfig?.fps || DefaultFps
    const render = createRender({
      fps,
      // showFps: true,
      enableMouseMoveEvent:
        context[pluginName].config.enableMouseMoveEvent ?? true,
      ...context.renderConfig,
    })
    syncPlayer(store)
    render(<Easy />)
  },
}))
