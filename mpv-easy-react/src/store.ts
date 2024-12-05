import {
  type RematchDispatch,
  type RematchRootState,
  init,
} from "@rematch/core"
import { type RootModel, models } from "./models"
import { pluginName } from "./main"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { pluginName as anime4kName } from "@mpv-easy/anime4k"
import { pluginName as autoloadName } from "@mpv-easy/autoload"
import { pluginName as thumbfastName } from "@mpv-easy/thumbfast"
import { pluginName as translateName } from "@mpv-easy/translate"
import { pluginName as cutName } from "@mpv-easy/cut"

import { normalize } from "@mpv-easy/tool"

export function createStore() {
  return init<RootModel>({
    models,
  })
}

export type Store = ReturnType<typeof createStore>
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>

export const modeSelector = (state: RootState) => state.context[pluginName].mode
export const styleSelector = (state: RootState) =>
  state.context[pluginName].style

export const uiNameSelector = (state: RootState) =>
  state.context[pluginName].uiName

export const audoloadConfigSelector = (state: RootState) =>
  state.context[autoloadName]

export const languageSelector = (state: RootState) =>
  state.context[i18nName].default
export const i18nSelector = (state: RootState) =>
  state.context[i18nName].lang[languageSelector(state)]

export const anime4kSelector = (state: RootState) => state.context[anime4kName]

export const playerSelector = (state: RootState) =>
  state.context[pluginName].player
export const pauseSelector = (state: RootState) =>
  state.context[pluginName].player.pause
export const fullscreenSelector = (state: RootState) =>
  state.context[pluginName].player.fullscreen
export const muteSelector = (state: RootState) =>
  state.context[pluginName].player.mute
export const mousePosSelector = (state: RootState) =>
  state.context[pluginName].player.mousePos
export const pathSelector = (state: RootState) =>
  normalize(state.context[pluginName].player.path ?? "")

export const playlistPosSelector = (state: RootState) =>
  state.context[pluginName].player.playlistPos

export const durationSelector = (state: RootState) =>
  state.context[pluginName].player.duration
export const timePosSelector = (state: RootState) =>
  state.context[pluginName].player.timePos

export const aidSelector = (state: RootState) =>
  state.context[pluginName].player.aid

export const vidSelector = (state: RootState) =>
  state.context[pluginName].player.vid

export const sidSelector = (state: RootState) =>
  state.context[pluginName].player.sid

export const volumeSelector = (state: RootState) =>
  state.context[pluginName].player.volume

export const volumeMaxSelector = (state: RootState) =>
  state.context[pluginName].player.volumeMax

export const videoParamsSelector = (state: RootState) =>
  state.context[pluginName].player.videoParams

export const fpsSelector = (state: RootState) =>
  state.context[pluginName].config.fps

export const frameTimeSelector = (state: RootState) =>
  1000 / state.context[pluginName].config.fps

export const buttonStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].button.default

export const controlSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].control

export const fontSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].font
export const IconButtonSizeSelector = (state: RootState) => {
  const button = styleSelector(state)[modeSelector(state)].button.default
  return button.width + button.padding * 2
}

export const fontSizeSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].button.default.fontSize

export const smallFontSizeSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].button.default.fontSize * 0.75

export const largeFontSizeSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].button.default.fontSize * 1.25

export const scrollListStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].scrollList

export const volumeStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].volume

export const dropdownStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].dropdown

export const clickMenuStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].clickMenu

export const controlStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].control
export const progressStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].progress
export const toolbarStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].toolbar
export const tooltipStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].tooltip

export const playlistStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].playlist
export const historyStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].history
export const speedStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].speed

export const playlistSelector = (state: RootState) =>
  state.context[pluginName].player.playlist
export const osdDimensionsSelector = (state: RootState) =>
  state.context[pluginName].player.osdDimensions
export const speedSelector = (state: RootState) =>
  state.context[pluginName].player.speed
export const speedListSelector = (state: RootState) =>
  state.context[pluginName].player.speedList
export const historySelector = (state: RootState) =>
  state.context[pluginName].history
export const playModeSelector = (state: RootState) =>
  state.context[pluginName].player.playMode

export const playlistHideSelector = (state: RootState) =>
  state.context[pluginName].state.playlistHide

export const historyHideSelector = (state: RootState) =>
  state.context[pluginName].state.historyHide

export const mouseHoverStyleSelector = (state: RootState) =>
  state.context.experimental.mouseHoverStyle

export const enablePluginsStyleSelector = (state: RootState) =>
  state.context.enablePlugins

export const protocolHookSelector = (state: RootState) =>
  state.context[pluginName].config.protocolHook

export const thumbfastSelector = (state: RootState) =>
  state.context[thumbfastName]

export const translateSelector = (state: RootState) =>
  state.context[translateName]

export const cutSelector = (state: RootState) => state.context[cutName]
