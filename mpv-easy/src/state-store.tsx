import { PluginContext, SystemApi } from "@mpv-easy/plugin"
import { useEffect, useState } from "react"
import type { ThemeName, ThemeMode } from "./main"
import { pluginName } from "./main"
import { Language, LanguageKey, pluginName as i18nName } from "@mpv-easy/i18n"
import {
  MousePos,
  PropertyBool,
  PropertyNative,
  PropertyNumber,
  PropertyString,
  command,
  setPropertyBool,
  setPropertyNumber,
  setPropertyString,
} from "@mpv-easy/tool"
import throttle from "lodash-es/throttle"
import isEqual from "lodash-es/isEqual"

const windowMaximizedProp = new PropertyBool("window-maximized")
const fullscreenProp = new PropertyBool("fullscreen")
const timePosProp = new PropertyNumber("time-pos")
const durationProp = new PropertyNumber("duration")
const pauseProp = new PropertyBool("pause")
const pathProp = new PropertyString("path")
const mousePosProp = new PropertyNative<MousePos>("mouse-pos")
const muteProp = new PropertyBool("mute")

export function useStore(context: PluginContext, api: SystemApi) {
  const [store, setStore] = useState(context)

  const dispatch = {
    setMode(mode: ThemeMode) {
      store[pluginName].mode = mode
      setStore({ ...store })
      api.saveConfig(store)
    },

    setTheme(name: ThemeName) {
      store[pluginName].name = name
      setStore({ ...store })
      api.saveConfig(store)
    },

    setLanguage(language: Language) {
      store[i18nName].default = language
      setStore({ ...store })
      api.saveConfig(store)
    },
    setUI(name: "osc" | "uosc") {
      store[pluginName].name = name
      setStore({ ...store })
      api.saveConfig(store)
    },
    setPause(pause: boolean) {
      store[pluginName].player.pause = pause
      pauseProp.value = pause
      setStore({ ...store })
      // api.saveConfig(store)
    },
    setMute(mute: boolean) {
      store[pluginName].player.mute = mute
      muteProp.value = mute
      setStore({ ...store })
      // api.saveConfig(store)
    },
    setTimePos(pos: number) {
      store[pluginName].player.timePos = pos
      setPropertyNumber("time-pos", pos)
      setStore({ ...store })
      // api.saveConfig(store)
    },
    setWindowMaximized(value: boolean) {
      store[pluginName].player.windowMaximized = value
      setPropertyBool("window-maximized", value)
      setStore({ ...store })
      // api.saveConfig(store)
    },
    setFullscreen(value: boolean) {
      store[pluginName].player.fullscreen = value
      setPropertyBool("fullscreen", value)
      setStore({ ...store })
      // api.saveConfig(store)
    },
    setDuration(value: number) {
      store[pluginName].player.duration = value
      setPropertyNumber("duration", value)
      setStore({ ...store })
      // api.saveConfig(store)
    },

    setWindowMinimized(value: boolean) {
      store[pluginName].player.windowMinimized = value
      setPropertyBool("window-minimized", value)
      setStore({ ...store })
      // api.saveConfig(store)
    },
    setPath(value: string) {
      store[pluginName].player.path = value
      setPropertyString("path", value)
      setStore({ ...store })
      // api.saveConfig(store)
    },

    screenshot() {
      command("screenshot window")
    },

    setTooltip(hide: boolean, text: string) {
      store[pluginName].player.mousePos = mousePosProp.value
      store[pluginName].state.tooltipHide = hide
      store[pluginName].state.tooltipText = text
      setStore({ ...store })
    },
    setMousePos(pos: MousePos) {
      store[pluginName].player.mousePos = pos
      setStore({ ...store })
    },
    setHide(hide: boolean) {
      store[pluginName].state.hide = hide
      setStore({ ...store })
    },
  } as const

  useEffect(() => {
    windowMaximizedProp.observe((v) => {
      setPropertyBool("window-maximized", v)
      store[pluginName].player.windowMaximized = v
      setStore({ ...store })
      api.saveConfig(store)
    })

    fullscreenProp.observe((v) => {
      setPropertyBool("fullscreen", v)
      store[pluginName].player.fullscreen = v
      setStore({ ...store })
      // api.saveConfig(store)
    })

    timePosProp.observe(
      throttle(
        (v) => {
          dispatch.setTimePos(v || 0)
        },
        store[pluginName].state.timePosThrottle,
        { leading: true, trailing: true },
      ),
    )

    durationProp.observe((v) => {
      dispatch.setDuration(v || 0)
    })

    pathProp.observe((v) => {
      dispatch.setPath(v || "")
    })

    const cb = throttle(
      (v) => {
        dispatch.setMousePos(v)
      },
      store[pluginName].state.mousePosThrottle,
      { leading: true, trailing: true },
    )

    muteProp.observe((v) => {
      dispatch.setMute(v)
    })

    pauseProp.observe((v) => {
      dispatch.setPause(v)
    })

    mousePosProp.observe(cb, isEqual)
  }, [])

  const t = (key: LanguageKey) => {
    const language = store[i18nName].default
    return store[i18nName].lang[language][key]
  }
  return { store, dispatch, t }
}

export type Store = PluginContext
export type Dispatch = ReturnType<typeof useStore>["dispatch"]
export type I18nT = ReturnType<typeof useStore>["t"]

export type StoreProps = { store: Store; dispatch: Dispatch; t: I18nT }
