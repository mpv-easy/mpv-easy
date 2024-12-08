import { DefaultFps, createRender } from "@mpv-easy/react"
import React from "react"
import { definePlugin } from "@mpv-easy/plugin"
import { Easy } from "./ui"
import {
  defaultSaveConfigThrottle,
  defaultState,
  type EasyConfig,
} from "./mpv-easy-theme"
import type { Store } from "./models"
import throttle from "lodash-es/throttle"
export const pluginName = "@mpv-easy/easy-react"

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: EasyConfig
  }

  interface SystemApi {
    store: Store
  }
}

export { defaultConfig } from "./mpv-easy-theme"

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    const store = api.store
    store.setStore(context)

    // TODO: Temporary attributes should not be saved
    context[pluginName].state = defaultState
    store.subscribe(
      throttle(() => {
        const state = store.getSnapshot()
        api.saveConfig(state)
      }, defaultSaveConfigThrottle),
    )
    const fps = context[pluginName].config.fps || DefaultFps
    const render = createRender({
      fps,
      // showFps: true,
      enableMouseMoveEvent:
        context[pluginName].config.enableMouseMoveEvent ?? true,
    })
    render(<Easy />)
  },
}))
