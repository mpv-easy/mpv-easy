import { createModel } from "@rematch/core"
import type { RootModel } from "."
import "@mpv-easy/tool"
import { PluginContext } from "@mpv-easy/plugin"
import { pluginName } from "../main"
import {
  PropertyBool,
  PropertyNumber,
  PropertyString,
  PropertyNative,
  MousePos,
  command,
  setPropertyBool,
  setPropertyNumber,
  setPropertyString,
} from "@mpv-easy/tool"
import { Language } from "@mpv-easy/i18n"
import { api } from "../context"
import { store } from "../example/redux-toolkit/store"
import { ThemeMode, ThemeName } from "../mpv-easy-theme"
import i18nPlugin, { pluginName as i18nName } from "@mpv-easy/i18n"

const windowMaximizedProp = new PropertyBool("window-maximized")
const fullscreenProp = new PropertyBool("fullscreen")
const timePosProp = new PropertyNumber("time-pos")
const durationProp = new PropertyNumber("duration")
const pauseProp = new PropertyBool("pause")
const pathProp = new PropertyString("path")
const mousePosProp = new PropertyNative<MousePos>("mouse-pos")
const muteProp = new PropertyBool("mute")

export const context = createModel<RootModel>()({
  state: {} as PluginContext,
  reducers: {
    setMode(state, mode: ThemeMode) {
      state[pluginName].mode = mode
      return { ...state }
    },

    setTheme(state, name: ThemeName) {
      state[pluginName].name = name
      return { ...state }
    },

    setLanguage(state, language: Language) {
      state[i18nName].default = language
      return { ...state }
    },
    setUI(state, name: "osc" | "uosc") {
      state[pluginName].name = name
      return { ...state }
    },
    setPause(state, pause: boolean) {
      state[pluginName].player.pause = pause
      pauseProp.value = pause
      return { ...state }
    },
    setMute(state, mute: boolean) {
      state[pluginName].player.mute = mute
      muteProp.value = mute
      return { ...state }
    },
    setTimePos(state, pos: number) {
      state[pluginName].player.timePos = pos
      setPropertyNumber("time-pos", pos)
      return { ...state }
    },
    setWindowMaximized(state, value: boolean) {
      state[pluginName].player.windowMaximized = value
      setPropertyBool("window-maximized", value)
      return { ...state }
    },
    setFullscreen(state, value: boolean) {
      state[pluginName].player.fullscreen = value
      setPropertyBool("fullscreen", value)
      return { ...state }
    },
    setDuration(state, value: number) {
      state[pluginName].player.duration = value
      setPropertyNumber("duration", value)
      return { ...state }
    },

    setWindowMinimized(state, value: boolean) {
      state[pluginName].player.windowMinimized = value
      setPropertyBool("window-minimized", value)
      return { ...state }
    },
    setPath(state, value: string) {
      state[pluginName].player.path = value
      setPropertyString("path", value)
      return { ...state }
    },

    screenshot() {
      command("screenshot window")
    },
    setMousePos(state, pos: MousePos) {
      state[pluginName].player.mousePos = pos
      return { ...state }
    },
    setHide(state, hide: boolean) {
      state[pluginName].state = {
        ...state[pluginName].state,
        hide,
      }
      return { ...state }
    },
    setTooltip(state, hide: boolean, text: string) {
      state[pluginName].player.mousePos = mousePosProp.value
      state[pluginName].state = {
        ...state[pluginName].state,
        tooltipHide: hide,
        tooltipText: text,
      }
      return { ...state }
    },
  },

  selectors: (slice) => ({}),
})
