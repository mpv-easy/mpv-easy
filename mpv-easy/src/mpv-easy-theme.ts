import { MousePos } from "@mpv-easy/tool"

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
export type UIName = "osc" | "uosc"

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
    color: string
    backgroundColor: string
    cursorColor: string
    cursorWidth: number
    previewCursorWidth: number
    previewCursorColor: string
    timeTextBackgroundColor: string
    timeTextColor: string
    font: string
    fontSize: number
    previewZIndex: number
  }

  control: {
    height: number
    backgroundColor: string
  }
  toolbar: {
    backgroundColor: string
    autoHideDelay: number
  }
  playlist: {
    backgroundColor: string
    zIndex: number
  }
  tooltip: {
    enable: boolean
    zIndex: number
    font: string
    fontSize: number
    padding: number
    color: string
    backgroundColor: string
    colorHover: string
    backgroundColorHover: string
  }
  dropdown: {
    zIndex: number
    font: string
    fontSize: number
    padding: number
    color: string
    backgroundColor: string
    colorHover: string
    backgroundColorHover: string
    button: Omit<ButtonStyle, "width" | "height">
  }
  clickMenu: {
    zIndex: number
    backgroundColor: string
  }
}
export type EasyConfig = {
  mode: ThemeMode
  uiName: UIName
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
    playlistPos: number
    duration: number
    windowMaximized: boolean
    fullscreen: boolean
    windowMinimized: boolean
    path: string
    mousePos: MousePos
    mute: boolean
    osdDimensions: {
      w: number
      h: number
    }
    playlist: string[]
  }
  state: {
    hide: boolean
    timePosThrottle: number
    mousePosThrottle: number
    saveConfigThrottle: number
    playlistHide: boolean
  }
  render: {
    rerenderThrottle: number
    enableMouseMoveEvent: boolean
  }
}
export const defaultTooltipZIndex = 128
export const defaultDropdownZIndex = 512
export const defaultToolbarZIndex = 256
export const defaultPreviewZIndex = 256
export const defaultClickMenuZIndex = 256
export const defaultPlaylistZIndex = 512
export const defaultFont = "FiraCode Nerd Font Mono Reg"
export const defaultFontSize = 80
export const defaultProgressFontSize = 60
export const defaultName = "uosc"
export const defaultPadding = 5
export const defaultButtonSize = 100
export const defaultCursorWidth = 10
export const defaultTimePosThrottle = 1000
export const defaultMousePosThrottle = 300
export const defaultHideDelay = 5000
export const defaultSaveConfigThrottle = 2000

export const defaultState: EasyConfig["state"] = {
  hide: false,
  timePosThrottle: defaultTimePosThrottle,
  mousePosThrottle: defaultMousePosThrottle,
  saveConfigThrottle: defaultSaveConfigThrottle,
  playlistHide: true,
}

export const defaultPlayer: EasyConfig["player"] = {
  pause: false,
  timePos: 0,
  duration: 0,
  windowMaximized: false,
  fullscreen: false,
  windowMinimized: false,
  path: "",
  mute: false,
  playlistPos: 0,
  mousePos: {
    x: 0,
    y: 0,
    hover: false,
  },
  osdDimensions: {
    w: 0,
    h: 0,
  },
  playlist: [],
}
export const defaultConfig: EasyConfig = {
  mode: "dark",
  uiName: defaultName,
  style: {
    dark: {
      button: {
        default: {
          padding: defaultPadding,
          color: White + AlphaShow,
          backgroundColor: Black + AlphaHide,
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
        color: White + AlphaShow,
        backgroundColor: Black + AlphaLow,
        cursorColor: White + AlphaShow,
        cursorWidth: defaultCursorWidth,
        previewCursorWidth: defaultCursorWidth,
        previewCursorColor: White + AlphaMedium,
        timeTextBackgroundColor: White + AlphaHide,
        timeTextColor: White + AlphaShow,
        fontSize: defaultProgressFontSize,
        font: defaultFont,
        previewZIndex: defaultPreviewZIndex,
      },
      control: {
        backgroundColor: Black + AlphaLow,
        height: defaultButtonSize,
      },
      toolbar: {
        backgroundColor: Black + AlphaLow,
        autoHideDelay: defaultHideDelay,
      },
      playlist: {
        backgroundColor: Black + AlphaLow,
        zIndex: defaultPlaylistZIndex,
      },
      tooltip: {
        enable: true,
        zIndex: defaultTooltipZIndex,
        padding: defaultPadding,
        color: White + AlphaShow,
        backgroundColor: Black + AlphaLow,
        colorHover: Yellow + AlphaShow,
        backgroundColorHover: White + AlphaMedium,
        fontSize: defaultFontSize,
        font: defaultFont,
      },
      dropdown: {
        zIndex: defaultDropdownZIndex,
        padding: defaultPadding,
        color: White + AlphaShow,
        backgroundColor: Black + AlphaLow,
        colorHover: Yellow + AlphaShow,
        backgroundColorHover: White + AlphaMedium,
        fontSize: defaultFontSize,
        font: defaultFont,
        button: {
          padding: defaultPadding,
          color: White + AlphaShow,
          backgroundColor: Black + AlphaHide,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: White + AlphaMedium,
          fontSize: defaultFontSize,
          font: defaultFont,
          // width: defaultButtonSize,
          // height: defaultButtonSize,
        },
      },
      clickMenu: {
        backgroundColor: Black + AlphaLow,
        zIndex: defaultClickMenuZIndex,
      },
    },
    light: {
      button: {
        default: {
          padding: defaultPadding,
          color: Black + AlphaShow,
          backgroundColor: White + AlphaHide,
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
        color: Black + AlphaShow,
        backgroundColor: White + AlphaLow,
        cursorColor: Black + AlphaShow,
        cursorWidth: defaultCursorWidth,
        previewCursorWidth: defaultCursorWidth,
        previewCursorColor: Black + AlphaMedium,
        timeTextBackgroundColor: Black + AlphaHide,
        timeTextColor: Black + AlphaShow,
        fontSize: defaultProgressFontSize,
        font: defaultFont,
        previewZIndex: defaultPreviewZIndex,
      },
      control: {
        backgroundColor: White + AlphaLow,
        height: defaultButtonSize,
      },
      toolbar: {
        backgroundColor: White + AlphaLow,
        autoHideDelay: defaultHideDelay,
      },
      playlist: {
        backgroundColor: White + AlphaLow,
        zIndex: defaultPlaylistZIndex,
      },
      tooltip: {
        enable: true,
        zIndex: defaultTooltipZIndex,
        padding: defaultPadding,
        color: Black + AlphaShow,
        backgroundColor: White + AlphaLow,
        colorHover: Yellow + AlphaShow,
        backgroundColorHover: Black + AlphaMedium,
        fontSize: defaultFontSize,
        font: defaultFont,
      },
      dropdown: {
        padding: defaultPadding,
        color: Black + AlphaShow,
        backgroundColor: White + AlphaLow,
        colorHover: Yellow + AlphaShow,
        backgroundColorHover: Black + AlphaMedium,
        fontSize: defaultFontSize,
        font: defaultFont,
        zIndex: defaultDropdownZIndex,
        button: {
          padding: defaultPadding,
          color: Black + AlphaShow,
          backgroundColor: White + AlphaHide,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: Black + AlphaMedium,
          fontSize: defaultFontSize,
          font: defaultFont,
          // width: defaultButtonSize,
          // height: defaultButtonSize,
        },
      },
      clickMenu: {
        backgroundColor: White + AlphaLow,
        zIndex: defaultClickMenuZIndex,
      },
    },
  },
  progress: {
    save: true,
    time: 0,
  },
  player: defaultPlayer,
  state: defaultState,
  render: {
    rerenderThrottle: 100,
    enableMouseMoveEvent: true,
  },
}
