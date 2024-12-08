import type { PluginContext } from "@mpv-easy/plugin"
import { pluginName } from "../main"
import {
  PropertyBool,
  PropertyString,
  type MousePos,
  command,
  setPropertyBool,
  setPropertyString,
  type VideoParams,
  updatePlaylist,
  getPropertyString,
  isRemote,
  existsSync,
  commandv,
} from "@mpv-easy/tool"
import type { Language } from "@mpv-easy/i18n"
import { type ThemeMode, type UIName, PlayMode } from "../mpv-easy-theme"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import {
  pluginName as anime4kName,
  type Anime4kConfig,
} from "@mpv-easy/anime4k"
import {
  translate,
  pluginName as translateName,
  type TranslateConfig,
} from "@mpv-easy/translate"
import { createDefaultContext } from "../context"
import { getVideoName } from "../common"
import { defineStore } from "./easy-store"

const pauseProp = new PropertyBool("pause")
const pathProp = new PropertyString("path")
const muteProp = new PropertyBool("mute")

const store = defineStore({
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
    setUI(state, name: UIName) {
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
      return state
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
    setPlayMode(state, playMode: PlayMode) {
      state[pluginName].player.playMode = playMode
      return { ...state }
    },
    setSpeed(state, speed: number) {
      state[pluginName].player.speed = speed
      return { ...state }
    },
    setPlaylist(state: PluginContext, playlist: string[], playIndex: number) {
      // setPlaylist(state, playlist: string[], playIndex: number) {
      state[pluginName].player = {
        ...state[pluginName].player,
        playlist,
        path: playlist[playIndex],
      }
      updatePlaylist(playlist, playIndex)
      return { ...state }
    },
    addHistory(state, path: string) {
      if (!isRemote(path) && !existsSync(path)) {
        return state
      }
      const history = state[pluginName].history || []
      const index = history.findIndex((i) => i.path === path)

      const newHistory = [...history]
      if (index >= 0) {
        newHistory.splice(index, 1)
      }
      newHistory.unshift({ path, name: getVideoName(path) })

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
      if (newPos === pos) {
        return state
      }
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
      if (newPos === pos) {
        return state
      }
      state[pluginName].player.playlistPos = newPos
      state[pluginName].player.path = list[newPos]
      pathProp.value = list[newPos]
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
    setCutPoints(state, cutPoints: number[]) {
      state[pluginName].state = {
        ...state[pluginName].state,
        cutPoints,
      }
      return { ...state }
    },
    setCropPoints(state, cropArea: [number, number][]) {
      state[pluginName].state = {
        ...state[pluginName].state,
        cropPoints: cropArea,
      }
      return { ...state }
    },
    setShowCrop(state, showCrop: boolean) {
      state[pluginName].state = {
        ...state[pluginName].state,
        showCrop,
      }
      return { ...state }
    },
    resetConfig(state) {
      return createDefaultContext()
    },
    setProtocolHook(state, exePath: string) {
      state[pluginName].config.protocolHook = exePath
      return { ...state }
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

    translate(state) {
      const config = state[translateName]
      translate(config)
      return state
    },
  },
})

export const {
  subscribe,
  useSelector,
  // useStore,
  getSnapshot,
  dispatch,
  setStore,
} = store
export { store }
export type Store = typeof store
