import type { PluginContext } from "@mpv-easy/plugin"
import { pluginName } from "../main"
import {
  PropertyBool,
  PropertyString,
  setPropertyBool,
  updatePlaylist,
  getPropertyString,
  isRemote,
  existsSync,
  clamp,
  PropertyNumber,
  PropertyNative,
  getMpvPlaylist,
  normalize,
  dirname,
  getExtName,
  setPropertyNumber,
  loadfile,
  loadRemoteSubtitleAsync,
  setPropertyNative,
  screenshot,
  showNotification,
  quit,
  playlistPlayIndex,
  setPropertyString,
} from "@mpv-easy/tool"
import type { Language } from "@mpv-easy/i18n"
import { type ThemeMode, type UIName, PlayMode } from "../mpv-easy-theme"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import {
  pluginName as anime4kName,
  type Anime4kConfig,
} from "@mpv-easy/anime4k"
import { translate, pluginName as translateName } from "@mpv-easy/translate"
import { createDefaultContext } from "../context"
import { getVideoName } from "../common"
import { defineStore } from "./easy-store"
import { getPlayableList } from "@mpv-easy/autoload"

const store = defineStore({
  state: {} as PluginContext,
  reducers: {
    setMode(state, mode: ThemeMode) {
      state[pluginName].mode = mode
      return { ...state }
    },
    // setOsdDimensions(state, dim) {
    //   state[pluginName].player = {
    //     ...state[pluginName].player,
    //     "osd-dimensions": dim,
    //   }
    //   return { ...state }
    // },
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
      setPropertyBool("pause", pause)
      state[pluginName].player.pause = pause
      return { ...state }
    },
    setMute(state, mute: boolean) {
      setPropertyBool("mute", mute)
      state[pluginName].player.mute = mute
      // muteProp.value = mute
      return { ...state }
    },
    toggleTooltip(state) {
      state[pluginName].tooltip = !state[pluginName].tooltip
      return { ...state }
    },
    setTimePos(state, timePos: number) {
      state[pluginName].player["time-pos"] = timePos
      setPropertyNumber("time-pos", timePos)
      return { ...state }
    },
    setWindowMaximized(state, value: boolean) {
      state[pluginName].player["window-maximized"] = value
      setPropertyBool("window-maximized", value)
      return { ...state }
    },
    setFullscreen(state, value: boolean) {
      state[pluginName].player.fullscreen = value
      setPropertyBool("fullscreen", value)
      return { ...state }
    },
    // setDuration(state, value: number) {
    //   state[pluginName].player.duration = value
    //   // setPropertyNumber("duration", value)
    //   return { ...state }
    // },

    setWindowMinimized(state, value: boolean) {
      state[pluginName].player["window-minimized"] = value
      setPropertyBool("window-minimized", value)
      return { ...state }
    },
    setPath(state, value: string) {
      state[pluginName].player.path = value
      if (value !== getPropertyString("path")) {
        // setPropertyString("path", value)
        loadfile(value)
      }
      return { ...state }
    },
    playVideo(state, path: string) {
      loadfile(path, "replace")
      return state
    },
    screenshot(state) {
      screenshot("video")
      showNotification("screenshot")
      return { ...state }
    },
    // setMousePos(state, pos: MousePos) {
    //   state[pluginName].player["mouse-pos"] = pos
    //   return { ...state }
    // },
    setHide(state, hide: boolean) {
      state[pluginName].state = {
        ...state[pluginName].state,
        hide,
      }
      return { ...state }
    },
    setMountIndex(state, mountIndex: number) {
      state[pluginName].state.mountIndex = mountIndex
      state[pluginName].state = {
        ...state[pluginName].state,
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
      state[pluginName].player = {
        ...state[pluginName].player,
        playlist,
        path: playlist[playIndex],
      }
      updatePlaylist(playlist, playIndex)
      return { ...state }
    },
    addHistory(state, path: string) {
      if (!path) {
        return state
      }
      path = path.replaceAll("\\", "/")
      if (!isRemote(path) && !existsSync(path)) {
        return state
      }
      // const name =
      //   (isRemote(path) ? getVideoTitle(path) : getVideoName(path)) || ""
      const history = state[pluginName].history || []
      const index = history.findIndex((i) => i.path === path)

      const newHistory = [...history]
      if (index >= 0) {
        newHistory.splice(index, 1)
      }
      // newHistory.unshift({ path, name })
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
      quit(0)
      return { ...state }
    },
    next(state) {
      const list = state[pluginName].player.playlist
      const path = state[pluginName].player.path
      const len = list.length
      const pos = list.indexOf(path)
      if (pos === -1) {
        console.error(`not found video: ${path} in playlist`)
        return state
      }
      const newPos = (pos + 1) % len
      if (newPos === pos) {
        return state
      }
      playlistPlayIndex(newPos)
      return { ...state }
    },
    previous(state) {
      const list = state[pluginName].player.playlist
      const path = state[pluginName].player.path
      const len = list.length
      const pos = list.indexOf(path)
      if (pos === -1) {
        console.error(`not found video: ${path} in playlist`)
        return state
      }
      const newPos = (pos + len - 1) % len
      if (newPos === pos) {
        return state
      }
      playlistPlayIndex(newPos)
      return { ...state }
    },
    setVid(state, vid: number) {
      setPropertyNative("vid", vid === -1 ? "no" : vid)
      return { ...state }
    },
    setAid(state, aid: number) {
      setPropertyNative("aid", aid === -1 ? "no" : aid)
      return { ...state }
    },
    setSid(state, sid: number) {
      setPropertyNative("sid", sid === -1 ? "no" : sid)
      return { ...state }
    },
    setAnime4k(state, config: Anime4kConfig) {
      state[anime4kName] = { ...config }
      return { ...state }
    },
    setVolume(state, volume: number) {
      setPropertyNumber("volume", volume)
      state[pluginName].player = { ...state[pluginName].player, volume }
      return { ...state }
    },
    setVolumeMax(state, volumeMax: number) {
      state[pluginName].player = {
        ...state[pluginName].player,
        "volume-max": volumeMax,
      }
      return { ...state }
    },
    setCutPoints(state, cutPoints: number[]) {
      state[pluginName].state = {
        ...state[pluginName].state,
        cutPoints,
      }
      return { ...state }
    },
    setCropPoints(state, cropSegment: [number, number][]) {
      state[pluginName].state = {
        ...state[pluginName].state,
        cropPoints: cropSegment,
      }
      return { ...state }
    },
    cancel(state) {
      let {
        cropPoints = [],
        cutPoints = [],
        showCrop,
        preview,
      } = state[pluginName]?.state || {}

      const a = state[pluginName]?.player["ab-loop-a"]
      const b = state[pluginName]?.player["ab-loop-b"]

      if (preview && a !== undefined && b !== undefined) {
        setPropertyString("ab-loop-a", "no")
        setPropertyString("ab-loop-b", "no")

        state[pluginName].state = {
          ...state[pluginName].state,
          preview: false,
        }
        return { ...state }
      }

      if (showCrop && cropPoints.length === 0) {
        showCrop = false
      }

      cropPoints = cropPoints.length > 0 ? cropPoints.slice(0, -1) : []
      cutPoints = cutPoints.length > 0 ? cutPoints.slice(0, -1) : []

      state[pluginName].state = {
        ...state[pluginName].state,
        cropPoints,
        cutPoints,
        showCrop,
        preview: false,
      }
      return { ...state }
    },
    preview(state) {
      const { cutPoints } = state[pluginName].state

      if (cutPoints.length === 0) {
        return state
      }
      if (cutPoints.length === 1) {
        // state[pluginName].player["time-pos"] = cutPoints[0]
        setPropertyNumber("time-pos", cutPoints[0])
      } else if (cutPoints.length === 2) {
        const start = Math.min(cutPoints[0], cutPoints[1])
        const end = Math.max(cutPoints[0], cutPoints[1])

        setPropertyNumber("ab-loop-a", start)
        setPropertyNumber("ab-loop-b", end)
        // state[pluginName].player["time-pos"] = start
        setPropertyNumber("time-pos", start)

        state[pluginName].state = {
          ...state[pluginName].state,
          preview: true,
        }
      }
      setPropertyBool("pause", false)
      return { ...state }
    },
    setShowCrop(state, showCrop: boolean) {
      state[pluginName].state = {
        ...state[pluginName].state,
        showCrop,
      }
      return { ...state }
    },
    resetConfig(_state) {
      return createDefaultContext()
    },
    setProtocolHook(state, exePath: string) {
      state[pluginName].config.protocolHook = exePath
      return { ...state }
    },
    changeFontSize(state, n: number) {
      const { dark, light } = state[pluginName].style
      dark.fontSizeScale = clamp(dark.fontSizeScale + n, 0.2, 4)
      light.fontSizeScale = clamp(light.fontSizeScale + n, 0.2, 4)
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
  getState,
  dispatch,
  setState,
  unsubscribe,
  rerender,
} = store

export { store }
export type Store = typeof store
import { pluginName as autoloadName } from "@mpv-easy/autoload"
export type Dispatch = typeof dispatch

export function syncPlayer(store: Store) {
  const windowMaximizedProp = new PropertyBool("window-maximized")
  const windowMinimizedProp = new PropertyBool("window-minimized")
  const fullscreenProp = new PropertyBool("fullscreen")
  const timePosProp = new PropertyNumber("time-pos")
  const durationProp = new PropertyNumber("duration")
  const pauseProp = new PropertyBool("pause")
  const pathProp = new PropertyString("path")
  const mousePosProp = new PropertyNative("mouse-pos")
  const videoParamsProp = new PropertyNative("video-params")
  const muteProp = new PropertyBool("mute")
  const seekableProp = new PropertyBool("seekable")
  const videoZoomProp = new PropertyNumber("video-zoom")
  const aidProp = new PropertyNumber("aid")
  const vidProp = new PropertyNumber("vid")
  const sidProp = new PropertyNumber("sid")
  const volumeProp = new PropertyNumber("volume")
  const volumeMaxProp = new PropertyNumber("volume-max")
  const speedProp = new PropertyNumber("speed")
  const subScaleProp = new PropertyNumber("sub-scale")
  const playlistCountProp = new PropertyNumber("playlist/count")
  const playlistIndexProp = new PropertyNumber("playlist-play-index")
  const osdDimensionsProp = new PropertyNative("osd-dimensions")
  const mediaTitleProp = new PropertyString("media-title")
  const abLoopA = new PropertyNumber("ab-loop-a")
  const abLoopB = new PropertyNumber("ab-loop-b")

  const rerender = store.rerender

  const propList = [
    aidProp,
    vidProp,
    sidProp,
    speedProp,
    volumeProp,
    volumeMaxProp,
    videoParamsProp,
    windowMaximizedProp,
    fullscreenProp,
    timePosProp,
    durationProp,
    muteProp,
    pauseProp,
    mousePosProp,
    osdDimensionsProp,
    subScaleProp,
    seekableProp,
    playlistIndexProp,
    windowMinimizedProp,
    videoZoomProp,
    // update by pathProp.observe
    // pathProp,
    mediaTitleProp,
    abLoopA,
    abLoopB,
  ]
  function updateProp() {
    const state = store.getState()
    state[pluginName].player = {
      ...state[pluginName].player,
    }
    for (const i of propList) {
      // @ts-ignore
      state[pluginName].player[i.name] = i.value
    }
    store.setState({ ...state })
    rerender()
  }
  for (const i of propList) {
    i.observe(updateProp)
  }

  playlistCountProp.observe((_, _v) => {
    const p = pathProp.value
    const list = getMpvPlaylist()
    const i = list.indexOf(p)
    dispatch.setPlaylist(list, i === -1 ? 0 : i)
  })

  pathProp.observe((_, v) => {
    const state = store.getState()
    v = normalize(v ?? "")
    if (v?.length) {
      dispatch.setPath(v)
      loadRemoteSubtitleAsync(v)
      dispatch.addHistory(v)

      const d = dirname(v)
      if (!d) {
        return
      }
      const list = getPlayableList(
        state[autoloadName],
        v,
        d,
        getExtName(v) || "",
      )
      const playIndex = list.indexOf(v)
      dispatch.setPlaylist(list, playIndex === -1 ? 0 : playIndex)
    }
  })

  mediaTitleProp.observe((_, _v) => {
    // wait yt-dlp update media-title
    dispatch.addHistory(pathProp.value)
  })
  updateProp()
}
