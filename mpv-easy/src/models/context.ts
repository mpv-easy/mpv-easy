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
  MpvPropertyTypeMap,
} from "@mpv-easy/tool"
import { Language } from "@mpv-easy/i18n"
import { ThemeMode, UIName } from "../mpv-easy-theme"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { playlistSelector } from "../store"

const windowMaximizedProp = new PropertyBool("window-maximized")
const fullscreenProp = new PropertyBool("fullscreen")
const timePosProp = new PropertyNumber("time-pos")
const durationProp = new PropertyNumber("duration")
const pauseProp = new PropertyBool("pause")
const pathProp = new PropertyString("path")
const mousePosProp = new PropertyNative<MousePos>("mouse-pos")
const muteProp = new PropertyBool("mute")
const osdDimensionsProp = new PropertyNative<{
  w: number
  h: number
}>("osd-dimensions")

export const context = createModel<RootModel>()({
  state: {} as PluginContext,
  reducers: {
    setMode(state, mode: ThemeMode) {
      state[pluginName].mode = mode
      return { ...state }
    },
    setOsdDimensions(state, dim) {
      state[pluginName].player.osdDimensions = dim
      return { ...state }
    },
    setTheme(state, name: UIName) {
      state[pluginName].uiName = name
      return { ...state }
    },

    setLanguage(state, language: Language) {
      state[i18nName].default = language
      return { ...state }
    },
    setUI(state, name: "osc" | "uosc") {
      state[pluginName].uiName = name
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

    screenshot(state) {
      command("screenshot window")
      return state
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
    // setTooltip(state, hide: boolean, text: string) {
    //   state[pluginName].player.mousePos = mousePosProp.value
    //   return { ...state }
    // },
    setPlaylistHide(state, hide: boolean) {
      state[pluginName].state.playlistHide = hide
      return { ...state }
    },
    setPlaylist(state, list: string[]) {
      state[pluginName].player.playlist = list
      return { ...state }
    },
    exit(state) {
      command("quit")
      return { ...state }
    },
    next(state) {
      command("playlist-next")
      const list = state[pluginName].player.playlist
      const len = list.length
      const pos = state[pluginName].player.playlistPos
      const newPos = (pos + len - 1) % len
      state[pluginName].player.playlistPos = newPos
      state[pluginName].player.path = list[newPos]
      return { ...state }
    },
    previous(state) {
      command("playlist-next")
      const list = state[pluginName].player.playlist
      const len = list.length
      const pos = state[pluginName].player.playlistPos
      const newPos = (pos + 1) % len
      state[pluginName].player.playlistPos = newPos
      state[pluginName].player.path = list[newPos]
      return { ...state }
    },
  },

  selectors: (slice) => ({}),
})
