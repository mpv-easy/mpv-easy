import { createModel } from "@rematch/core"
import type { RootModel } from "."
import "@mpv-easy/tool"
import type { PluginContext } from "@mpv-easy/plugin"
import { pluginName } from "../main"
import {
  PropertyBool,
  PropertyNumber,
  PropertyString,
  PropertyNative,
  type MousePos,
  command,
  setPropertyBool,
  setPropertyNumber,
  setPropertyString,
  MpvPropertyTypeMap,
  getPropertyNative,
  setPropertyNative,
  type VideoParams,
  updatePlaylist,
  getPropertyNumber,
  getPropertyString,
  isHttp,
  existsSync,
  commandv,
} from "@mpv-easy/tool"
import type { Language } from "@mpv-easy/i18n"
import { type ThemeMode, type UIName, createDefaultThemeConfig } from "../mpv-easy-theme"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { pluginName as anime4kName, type Anime4kConfig } from "@mpv-easy/anime4k"
import { createDefaultContext } from "../context"
import { historySelector, historyStyleSelector } from "../store"

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
      // setPropertyNumber("duration", value)
      return { ...state }
    },

    setWindowMinimized(state, value: boolean) {
      state[pluginName].player.windowMinimized = value
      setPropertyBool("window-minimized", value)
      return { ...state }
    },
    setPath(state, value: string) {
      state[pluginName].player.path = value
      if (value !== getPropertyString("path")) {
        setPropertyString("path", value)
      }
      return { ...state }
    },
    playVideo(state, path: string) {
      commandv("loadfile", path, "replace")
    },
    screenshot(state) {
      command("screenshot video")
      return { ...state }
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
    setPlaylistHide(state, hide: boolean) {
      state[pluginName].state.playlistHide = hide
      return { ...state }
    },
    setHistoryHide(state, hide: boolean) {
      state[pluginName].state.historyHide = hide
      return { ...state }
    },
    setSpeed(state, speed: number) {
      state[pluginName].player.speed = speed
      return { ...state }
    },
    setPlaylist(state, playlist: string[], playIndex: number) {
      state[pluginName].player = {
        ...state[pluginName].player,
        playlist,
        path: playlist[playIndex],
      }
      updatePlaylist(playlist, playIndex)
      return { ...state }
    },
    addHistory(state, path: string) {
      if (!isHttp(path) && !existsSync(path)) {
        return state
      }
      const history = state[pluginName].history || []
      const index = history.findIndex((i) => i === path)

      const newHistory = [...history]
      if (index >= 0) {
        newHistory.splice(index, 1)
      }
      newHistory.unshift(path)

      const mode = state[pluginName].mode
      const stackSize = state[pluginName].style[mode].history.stackSize
      while (newHistory.length > stackSize) {
        newHistory.pop()
      }
      state[pluginName].history = newHistory
      return { ...state }
    },
    exit(state) {
      command("quit")
      return { ...state }
    },
    next(state) {
      const list = state[pluginName].player.playlist
      const path = state[pluginName].player.path
      const len = list.length
      const pos = list.indexOf(path)
      const newPos = (pos + 1) % len
      state[pluginName].player.playlistPos = newPos
      state[pluginName].player.path = list[newPos]
      pathProp.value = list[newPos]
      command(`playlist-play-index ${newPos}`)
      return { ...state }
    },
    previous(state) {
      const list = state[pluginName].player.playlist
      const path = state[pluginName].player.path
      const len = list.length
      const pos = list.indexOf(path)
      const newPos = (pos + len - 1) % len
      state[pluginName].player.playlistPos = newPos
      state[pluginName].player.path = list[newPos]
      command(`playlist-play-index ${newPos}`)
      return { ...state }
    },
    setVid(state, vid: number) {
      state[pluginName].player = { ...state[pluginName].player, vid }
      return { ...state }
    },
    setAid(state, aid: number) {
      state[pluginName].player = { ...state[pluginName].player, aid }
      return { ...state }
    },
    setSid(state, sid: number) {
      state[pluginName].player = { ...state[pluginName].player, sid }
      return { ...state }
    },
    setAnime4k(state, config: Anime4kConfig) {
      state[anime4kName] = { ...config }
      return { ...state }
    },
    setVideoParams(state, videoParams: VideoParams) {
      state[pluginName].player = { ...state[pluginName].player, videoParams }
      return { ...state }
    },
    setVolume(state, volume: number) {
      state[pluginName].player = { ...state[pluginName].player, volume }
      return { ...state }
    },
    setVolumeMax(state, volumeMax: number) {
      state[pluginName].player = { ...state[pluginName].player, volumeMax }
      return { ...state }
    },
    resetConfig(state) {
      return createDefaultContext()
    },
    setFontSize(state, fontSize: number) {
      const size = fontSize + 16
      const padding = fontSize / 8
      // TODO: color config vs size config
      state[pluginName].style.dark.button.default.fontSize = fontSize
      state[pluginName].style.dark.button.default.width = size
      state[pluginName].style.dark.button.default.height = size
      state[pluginName].style.dark.button.default.padding = padding

      state[pluginName].style.light.button.default.fontSize = fontSize
      state[pluginName].style.light.button.default.width = size
      state[pluginName].style.light.button.default.height = size
      state[pluginName].style.light.button.default.padding = padding

      return { ...state }
    },
  },

  selectors: (slice) => ({}),
})
