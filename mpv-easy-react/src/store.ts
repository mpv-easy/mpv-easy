import { pluginName } from "./main"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { pluginName as anime4kName } from "@mpv-easy/anime4k"
import { pluginName as autoloadName } from "@mpv-easy/autoload"
import { pluginName as thumbfastName } from "@mpv-easy/thumbfast"
import { pluginName as translateName } from "@mpv-easy/translate"
import { pluginName as cutName } from "@mpv-easy/cut"
import { pluginName as cropName } from "@mpv-easy/crop"

import { normalize } from "@mpv-easy/tool"
import { dispatch, store } from "./models"
import { PluginContext } from "@mpv-easy/plugin"
export { dispatch, store }

export type Dispatch = typeof dispatch

export const modeSelector = (state: PluginContext) => state[pluginName].mode
export const styleSelector = (state: PluginContext) => state[pluginName].style

export const uiNameSelector = (state: PluginContext) => state[pluginName].uiName

export const audoloadConfigSelector = (state: PluginContext) =>
  state[autoloadName]

export const languageSelector = (state: PluginContext) =>
  state[i18nName].default
export const i18nSelector = (state: PluginContext) =>
  state[i18nName].lang[languageSelector(state)]

export const anime4kSelector = (state: PluginContext) => state[anime4kName]

export const playerSelector = (state: PluginContext) => state[pluginName].player

export const playerStateSelector = (state: PluginContext) =>
  state[pluginName].state

export const pauseSelector = (state: PluginContext) =>
  state[pluginName].player.pause
export const fullscreenSelector = (state: PluginContext) =>
  state[pluginName].player.fullscreen
export const muteSelector = (state: PluginContext) =>
  state[pluginName].player.mute
export const mousePosSelector = (state: PluginContext) =>
  state[pluginName].player.mousePos
export const pathSelector = (state: PluginContext) =>
  normalize(state[pluginName].player.path ?? "")

export const playlistPosSelector = (state: PluginContext) =>
  state[pluginName].player.playlistPos

export const durationSelector = (state: PluginContext) =>
  state[pluginName].player.duration
export const timePosSelector = (state: PluginContext) =>
  state[pluginName].player.timePos

export const aidSelector = (state: PluginContext) =>
  state[pluginName].player.aid

export const vidSelector = (state: PluginContext) =>
  state[pluginName].player.vid

export const sidSelector = (state: PluginContext) =>
  state[pluginName].player.sid

export const volumeSelector = (state: PluginContext) =>
  state[pluginName].player.volume

export const volumeMaxSelector = (state: PluginContext) =>
  state[pluginName].player.volumeMax

export const videoParamsSelector = (state: PluginContext) =>
  state[pluginName].player.videoParams

export const fpsSelector = (state: PluginContext) =>
  state[pluginName].config.fps

export const frameTimeSelector = (state: PluginContext) =>
  1000 / state[pluginName].config.fps

export const buttonStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].button.default

export const controlSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].control

export const fontSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].font
export const IconButtonSizeSelector = (state: PluginContext) => {
  const button = styleSelector(state)[modeSelector(state)].button.default
  return button.width + button.padding * 2
}

export const fontSizeSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].button.default.fontSize

export const smallFontSizeSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].button.default.fontSize * 0.75

export const largeFontSizeSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].button.default.fontSize * 1.25

export const scrollListStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].scrollList

export const volumeStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].volume

export const dropdownStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].dropdown

export const clickMenuStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].clickMenu

export const controlStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].control
export const progressStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].progress
export const toolbarStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].toolbar
export const tooltipStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].tooltip

export const playlistStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].playlist
export const historyStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].history
export const speedStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].speed

export const playlistSelector = (state: PluginContext) =>
  state[pluginName].player.playlist
export const osdDimensionsSelector = (state: PluginContext) =>
  state[pluginName].player.osdDimensions
export const speedSelector = (state: PluginContext) =>
  state[pluginName].player.speed
export const speedListSelector = (state: PluginContext) =>
  state[pluginName].player.speedList
export const historySelector = (state: PluginContext) =>
  state[pluginName].history
export const playModeSelector = (state: PluginContext) =>
  state[pluginName].player.playMode

export const playlistHideSelector = (state: PluginContext) =>
  state[pluginName].state.playlistHide

export const historyHideSelector = (state: PluginContext) =>
  state[pluginName].state.historyHide

export const mouseHoverStyleSelector = (state: PluginContext) =>
  state.experimental.mouseHoverStyle

export const enablePluginsStyleSelector = (state: PluginContext) =>
  state.enablePlugins

export const protocolHookSelector = (state: PluginContext) =>
  state[pluginName].config.protocolHook

export const thumbfastSelector = (state: PluginContext) => state[thumbfastName]

export const translateSelector = (state: PluginContext) => state[translateName]

export const cutSelector = (state: PluginContext) => state[cutName]

export const cropSelector = (state: PluginContext) => state[cropName]
