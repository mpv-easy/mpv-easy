import { RematchDispatch, RematchRootState, init } from "@rematch/core"
import selectPlugin from "@rematch/select"
import { RootModel, models } from "./models"
import { pluginName } from "./main"
import i18nPlugin, { pluginName as i18nName } from "@mpv-easy/i18n"
import { pluginName as anime4kName } from "@mpv-easy/anime4k"
import { getOs } from "@mpv-easy/tool"

export function createStore() {
  return init<RootModel>({
    models,
    // add selectPlugin to your store
    plugins: [selectPlugin()],
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
  state.context[pluginName].player.path

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

export const filenameSelector = (state: RootState) => {
  const path = pathSelector(state)
  if (path?.includes("\\")) {
    return path.replaceAll("\\", "/").split("/").at(-1)
  }
  return path.split("/").at(-1)
}

export const fpsSelector = (state: RootState) =>
  state.context[pluginName].config.fps

export const buttonStyleSelector = (state: RootState) =>
  styleSelector(state)[modeSelector(state)].button.default
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

export const playlistSelector = (state: RootState) =>
  state.context[pluginName].player.playlist
export const osdDimensionsSelector = (state: RootState) =>
  state.context[pluginName].player.osdDimensions

export const playlistHideSelector = (state: RootState) =>
  state.context[pluginName].state.playlistHide

export const mouseHoverStyleSelector = (state: RootState) =>
  state.context.experimental.mouseHoverStyle
