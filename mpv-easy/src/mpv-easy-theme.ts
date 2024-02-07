import { MousePos, VideoParams } from "@mpv-easy/tool"
import { defaultFPS } from "@mpv-easy/ui"
import { cloneDeep } from "lodash-es"

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
  volume: {
    backgroundColor: string
    autoHideDelay: number
    fontSize: number
    zIndex: number
    step: number
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
    aid: number
    vid: number
    sid: number
    videoParams: VideoParams
    volume: number
    volumeMax: number
  }
  state: {
    hide: boolean
    playlistHide: boolean
  }
  config: {
    fps: number
    enableMouseMoveEvent: boolean
    saveConfigThrottle: number
  }
}
export const defaultTooltipZIndex = 128
export const defaultDropdownZIndex = 512
export const defaultToolbarZIndex = 256
export const defaultPreviewZIndex = 256
export const defaultClickMenuZIndex = 256
export const defaultVolumeZIndex = 256
export const defaultPlaylistZIndex = 512
export const defaultFont = "FiraCode Nerd Font Mono Reg"
export const defaultFontSize = 80
export const defaultProgressFontSize = defaultFontSize * 0.75
export const defaultName = "uosc"
export const defaultPadding = defaultFontSize * 0.05
export const defaultButtonSize = defaultFontSize * 1.25
export const defaultCursorWidth = defaultFontSize * 0.05
export const defaultVolumeStep = 10

export const defaultHideUIDelay = 5000
export const defaultSaveConfigThrottle = 2000
// export const defaultRerenderThrottle = defaultRenderThrottle

export function createDefaultConfig() {
  return cloneDeep({
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
          autoHideDelay: defaultHideUIDelay,
        },
        volume: {
          backgroundColor: Black + AlphaLow,
          autoHideDelay: defaultHideUIDelay,
          fontSize: defaultFontSize * 0.75,
          zIndex: defaultVolumeZIndex,
          step: defaultVolumeStep,
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
          fontSize: defaultFontSize * 0.75,
          font: defaultFont,
        },
        dropdown: {
          zIndex: defaultDropdownZIndex,
          padding: defaultPadding,
          color: White + AlphaShow,
          backgroundColor: Black + AlphaLow,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: White + AlphaMedium,
          fontSize: defaultFontSize * 0.75,
          font: defaultFont,
          button: {
            padding: defaultPadding,
            color: White + AlphaShow,
            backgroundColor: Black + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
            fontSize: defaultFontSize * 0.75,
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
          autoHideDelay: defaultHideUIDelay,
        },
        volume: {
          backgroundColor: White + AlphaLow,
          fontSize: defaultFontSize * 0.75,
          autoHideDelay: defaultHideUIDelay,
          step: defaultVolumeStep,
          zIndex: defaultVolumeZIndex,
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
          fontSize: defaultFontSize * 0.75,
          font: defaultFont,
        },
        dropdown: {
          padding: defaultPadding,
          color: Black + AlphaShow,
          backgroundColor: White + AlphaLow,
          colorHover: Yellow + AlphaShow,
          backgroundColorHover: Black + AlphaMedium,
          fontSize: defaultFontSize * 0.75,
          font: defaultFont,
          zIndex: defaultDropdownZIndex,
          button: {
            padding: defaultPadding,
            color: Black + AlphaShow,
            backgroundColor: White + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
            fontSize: defaultFontSize * 0.75,
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
    config: {
      fps: defaultFPS,
      enableMouseMoveEvent: true,
      saveConfigThrottle: defaultSaveConfigThrottle,
    },
  } as const)
}
export const defaultState: EasyConfig["state"] = {
  hide: false,
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
  aid: 0,
  vid: 0,
  sid: 0,
  playlist: [],
  videoParams: {} as any,
  volume: 100,
  volumeMax: 130,
}
export const defaultConfig: EasyConfig = createDefaultConfig()
