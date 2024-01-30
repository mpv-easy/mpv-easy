import { MousePos, command } from "@mpv-easy/tool"
import { render } from "@mpv-easy/ui"
import React from "react"
import { definePlugin } from "@mpv-easy/plugin"

export const pluginName = "@mpv-easy/mpv-easy-ui"

const White = "FFFFFF"
const Black = "000000"
const Gray = "D3D3D3"
const Yellow = "00FFFF"

const AlphaHide = "FF"
const AlphaHigh = "C0"
const AlphaMedium = "80"
const AlphaLow = "40"
const AlphaShow = "00"

export type ThemeMode = "dark" | "light"
export type ThemeName = "osc" | "uosc"

export type ButtonStyle = {
  padding: number
  color: string
  backgroundColor: string
  colorHover: string
  backgroundColorHover: string
  fontSize: number
  font: string
  width: number
  height: number
}
export type ThemeStyle = {
  button: {
    default: ButtonStyle
    active: ButtonStyle
    hover: ButtonStyle
  }

  progress: {
    height: number
    backgroundColor: string
    cursorColor: string
    cursorWidth: number
    previewCursorWidth: number
    previewCursorColor: string
    timeTextBackgroundColor: string
    timeTextColor: string
    font: string
    fontSize: number
  }

  control: {
    backgroundColor: string
  }
  toolbar: {
    backgroundColor: string
  }
}
export type easyConfig = {
  mode: ThemeMode
  name: ThemeName
  style: {
    [x in ThemeMode]: ThemeStyle
  }
  progress: {
    save: boolean
    time: number
  }
  player: {
    pause: boolean
    timePos: number
    duration: number
    windowMaximized: boolean
    fullscreen: boolean
    windowMinimized: boolean
    path: string
    mousePos: MousePos
    mute: boolean
  }
  state: {
    tooltipHide: boolean
    tooltipText: string
    hide: boolean
    timePosThrottle: number
    mousePosThrottle: number
  }
}

export const defaultFont = "FiraCode Nerd Font Mono Reg"
export const defaultFontSize = 100
export const defaultProgressFontSize = 80
export const defaultName = "uosc"
export const defaultPadding = 10
export const defaultButtonSize = 100
export const defaultCursorWidth = 10
export const defaultTimePosThrottle = 1000
export const defaultMousePosThrottle = 500

export const defaultConfig: easyConfig = {
  mode: "dark",
  name: defaultName,
  style: {
    dark: {
      button: {
        default: {
          padding: defaultPadding,
          color: White + AlphaShow,
          backgroundColor: Black + AlphaLow,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: White + AlphaMedium,
          fontSize: defaultFontSize,
          font: defaultFont,
          width: defaultButtonSize,
          height: defaultButtonSize,
        },
        active: {
          padding: defaultPadding,
          color: White + AlphaShow,
          backgroundColor: Black + AlphaLow,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: White + AlphaMedium,
          fontSize: defaultFontSize,
          font: defaultFont,
          width: defaultButtonSize,
          height: defaultButtonSize,
        },
        hover: {
          padding: defaultPadding,
          color: White + AlphaShow,
          backgroundColor: Black + AlphaLow,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: White + AlphaMedium,
          fontSize: defaultFontSize,
          font: defaultFont,
          width: defaultButtonSize,
          height: defaultButtonSize,
        },
      },
      progress: {
        height: defaultButtonSize,
        backgroundColor: Black + AlphaLow,
        cursorColor: White + AlphaShow,
        cursorWidth: defaultCursorWidth,
        previewCursorWidth: defaultCursorWidth,
        previewCursorColor: White + AlphaMedium,
        timeTextBackgroundColor: White + AlphaHide,
        timeTextColor: White + AlphaShow,
        fontSize: defaultProgressFontSize,
        font: defaultFont,
      },
      control: {
        backgroundColor: Black + AlphaHide,
      },
      toolbar: {
        backgroundColor: Black + AlphaHide,
      },
    },
    light: {
      button: {
        default: {
          padding: defaultPadding,
          color: Black + AlphaShow,
          backgroundColor: White + AlphaLow,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: Black + AlphaMedium,
          fontSize: defaultFontSize,
          font: defaultFont,
          width: defaultButtonSize,
          height: defaultButtonSize,
        },
        active: {
          padding: defaultPadding,
          color: Black + AlphaShow,
          backgroundColor: White + AlphaLow,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: Black + AlphaMedium,
          fontSize: defaultFontSize,
          font: defaultFont,
          width: defaultButtonSize,
          height: defaultButtonSize,
        },
        hover: {
          padding: defaultPadding,
          color: Black + AlphaShow,
          backgroundColor: White + AlphaLow,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: Black + AlphaMedium,
          fontSize: defaultFontSize,
          font: defaultFont,
          width: defaultButtonSize,
          height: defaultButtonSize,
        },
      },
      progress: {
        height: defaultButtonSize,
        backgroundColor: White + AlphaLow,
        cursorColor: Black + AlphaShow,
        cursorWidth: defaultCursorWidth,
        previewCursorWidth: defaultCursorWidth,
        previewCursorColor: Black + AlphaMedium,
        timeTextBackgroundColor: Black + AlphaHide,
        timeTextColor: Black + AlphaShow,
        fontSize: defaultProgressFontSize,
        font: defaultFont,
      },
      control: {
        backgroundColor: White + AlphaHide,
      },
      toolbar: {
        backgroundColor: White + AlphaHide,
      },
    },
  },
  progress: {
    save: true,
    time: 0,
  },
  player: {
    pause: false,
    timePos: 0,
    duration: 0,
    windowMaximized: false,
    fullscreen: false,
    windowMinimized: false,
    path: "",
    mute: false,
    mousePos: {
      x: 0,
      y: 0,
      hover: false,
    },
  },
  state: {
    tooltipHide: true,
    tooltipText: "",
    hide: false,
    timePosThrottle: defaultTimePosThrottle,
    mousePosThrottle: defaultMousePosThrottle,
  },
}
declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: easyConfig
  }
}

import { Easy } from "./ui"

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    command("set osc no")
    command("set window-dragging no")
    render(<Easy context={context} api={api}></Easy>)
  },
}))
