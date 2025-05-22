import { pluginName } from "./main"
import { pluginName as i18nName } from "@mpv-easy/i18n"
import { pluginName as anime4kName } from "@mpv-easy/anime4k"
import { pluginName as autoloadName } from "@mpv-easy/autoload"
import { pluginName as thumbfastName } from "@mpv-easy/thumbfast"
import { pluginName as translateName } from "@mpv-easy/translate"
import { pluginName as cutName } from "@mpv-easy/cut"
import { pluginName as cropName } from "@mpv-easy/crop"
import { clamp, normalize } from "@mpv-easy/tool"
import { PluginContext } from "@mpv-easy/plugin"
import * as ICON from "./icon"
import { ButtonProps, DropdownProps } from "@mpv-easy/react"

export * from "./models"

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
  state[pluginName].player["mouse-pos"]
export const pathSelector = (state: PluginContext) =>
  normalize(state[pluginName].player.path ?? "")

export const playlistPlayIndexSelector = (state: PluginContext) =>
  state[pluginName].player["playlist-play-index"]

export const durationSelector = (state: PluginContext) =>
  state[pluginName].player.duration
export const timePosSelector = (state: PluginContext) =>
  state[pluginName].player["time-pos"]

export const aidSelector = (state: PluginContext) =>
  state[pluginName].player.aid

export const vidSelector = (state: PluginContext) =>
  state[pluginName].player.vid

export const sidSelector = (state: PluginContext) =>
  state[pluginName].player.sid

export const volumeSelector = (state: PluginContext) =>
  state[pluginName].player.volume

export const volumeMaxSelector = (state: PluginContext) =>
  state[pluginName].player["volume-max"]

export const videoParamsSelector = (state: PluginContext) =>
  state[pluginName].player["video-params"]

export const fpsSelector = (state: PluginContext) =>
  state[pluginName].config.fps

export const frameTimeSelector = (state: PluginContext) =>
  1000 / state[pluginName].config.fps

export const buttonStyleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].button.default

export const controlSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].control

export const fontSizeScaleSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].fontSizeScale

export const fontSelector = (state: PluginContext) =>
  styleSelector(state)[modeSelector(state)].font

export const cellSizeSelector = (state: PluginContext) => {
  const scale = fontSizeScaleSelector(state)
  // const w = osdDimensionsSelector(state).w
  // const cell = clamp(((w * scale) / 32) & ~15, 16, 256)
  // FIXME: dynamic font size
  const cell = clamp((64 * scale) & ~7, 16, 256)
  return cell
}

export const fontSizeSelector = (state: PluginContext) => {
  const cell = cellSizeSelector(state)
  const fontSize = (cell / 4) * 3
  const padding = cell / 8
  return { fontSize, padding }
}
export const normalFontSizeSelector = (state: PluginContext) =>
  fontSizeSelector(state)

export const smallFontSizeSelector = (state: PluginContext) => {
  const cell = fontSizeSelector(state).fontSize & ~7
  const fontSize = (cell / 4) * 3
  const padding = cell / 8
  return { fontSize, padding }
}

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
  state[pluginName].player["osd-dimensions"]
// getPropertyNative("osd-dimensions")!

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

export const mountSelector = (state: PluginContext) => state[pluginName].mount
export const mountIndexSelector = (state: PluginContext) =>
  state[pluginName].state.mountIndex
export const thumbfastSelector = (state: PluginContext) => state[thumbfastName]

export const translateSelector = (state: PluginContext) => state[translateName]

export const cutSelector = (state: PluginContext) => state[cutName]

export const cropSelector = (state: PluginContext) => state[cropName]

export const iconButtonStyle = (state: PluginContext): Partial<ButtonProps> => {
  const button = buttonStyleSelector(state)
  const fontSize = normalFontSizeSelector(state)
  const font = fontSelector(state)
  // const mouseHoverStyle = mouseHoverStyleSelector(state)
  // const size = cellSizeSelector(state)
  const size = fontSize.fontSize

  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
    // alignContent: 'stretch',
    // textAlign: 'center',
    width: size,
    height: size,
    // enableMouseStyle: mouseHoverStyle,
    // padding: 0,
    padding: fontSize.padding,
    colorHover: button.colorHover,
    backgroundColorHover: button.backgroundColorHover,
    backgroundColor: button.backgroundColor,
    fontSize: fontSize.fontSize,
    color: button.color,
    font,
  }
}

export const logoStyle = (state: PluginContext): Partial<ButtonProps> => {
  const button = buttonStyleSelector(state)
  const fontSize = normalFontSizeSelector(state)
  const font = fontSelector(state)
  const scale = 4
  const size = fontSize.fontSize
  return {
    height: size * scale,
    fontSize: fontSize.fontSize * scale,
    color: button.color,
    font,
  }
}

export const commonDropdownStyleSelector = (
  state: PluginContext,
): Partial<DropdownProps> => {
  const font = fontSelector(state)
  const mouseHoverStyle = mouseHoverStyleSelector(state)
  const dropdown = dropdownStyleSelector(state)
  const normalFontSize = normalFontSizeSelector(state)
  // const cell = cellSizeSelector(state)
  const size = normalFontSize.fontSize

  const item: Partial<DropdownProps> = {
    ...commonDropdownItemStyleSelector(state),
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  return {
    dropdownStyle: dropdown.button,
    width: size,
    height: size,
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
    // padding: 0,
    // alignContent: 'stretch',
    // textAlign: 'center',
    enableMouseStyle: mouseHoverStyle,
    padding: normalFontSize.padding,
    colorHover: dropdown.button.colorHover,
    backgroundColorHover: dropdown.button.backgroundColorHover,
    backgroundColor: dropdown.button.backgroundColor,
    font: font,
    fontSize: normalFontSize.fontSize,
    color: dropdown.button.color,
    dropdownListStyle: dropdown.list,
    pageDown: { style: item, text: ICON.TriangleDown },
    pageUp: { style: item, text: ICON.TriangleUp },
  }
}

export const commonDropdownItemStyleSelector = (
  state: PluginContext,
): Partial<DropdownProps> => {
  const { item } = dropdownStyleSelector(state)
  const font = fontSelector(state)
  const smallFontSize = smallFontSizeSelector(state)
  return {
    ...item,
    font,
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    padding: 0,
    // padding: smallFontSize.padding,
    fontSize: smallFontSize.fontSize,
    // height: smallFontSize.fontSize + smallFontSize.padding * 2,
    height: smallFontSize.fontSize,
  }
}

export const subScaleSelector = (state: PluginContext) =>
  state[pluginName].player["sub-scale"]

export const seekableSelector = (state: PluginContext) =>
  state[pluginName].player.seekable
