import type { MousePos, VideoParams } from "@mpv-easy/tool"
import { DefaultFps } from "@mpv-easy/react"

const White = "#FFFFFF"
const Black = "#000000"
const Gray = "#D3D3D3"
const Yellow = "#00FFFF"

const AlphaHide = "FF"
const AlphaHigh = "C0"
const AlphaMedium = "80"
const AlphaLow = "40"
const AlphaShow = "00"

export const PlayModeList = ["loopOne", "loopAll", "shuffle"] as const
export type PlayMode = (typeof PlayModeList)[number]

export const ThemeModeList = ["dark", "light"] as const
export type ThemeMode = (typeof ThemeModeList)[number]

export const UINameList = ["osc", "uosc", "oscx"] as const
export type UIName = (typeof UINameList)[number]
export const DefaultPlayMode: PlayMode = "loopAll"
export const DefaultClickMenuDisable = true

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
  font: string
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
    cursorSize: number
    previewCursorSize: number
    previewCursorColor: string
    timeTextBackgroundColor: string
    timeTextColor: string
    font: string
    previewZIndex: number
  }

  control: {
    height: number
    backgroundColor: string
  }
  toolbar: {
    backgroundColor: string
    autoHideDelay: number
    maxTitleLength: number
  }
  scrollList: {
    maxItemCount: number
  }
  volume: {
    previewCursorSize: number
    backgroundColor: string
    autoHideDelay: number
    zIndex: number
    step: number
    fontSize: number
    previewCursorColor: string
  }
  speed: {
    showText: boolean
    steps: {
      delay: number
      speed: number
    }[]
  }
  playlist: {
    backgroundColor: string
    zIndex: number
    maxTitleLength: number
  }
  history: {
    backgroundColor: string
    zIndex: number
    maxTitleLength: number
    stackSize: number
  }
  tooltip: {
    enable: boolean
    zIndex: number
    font: string
    padding: number
    color: string
    backgroundColor: string
    fontSize: number
    maxWidth: number
  }
  dropdown: {
    list: {
      zIndex: number
      font: string
      padding: number
      color: string
      backgroundColor: string
      colorHover: string
      backgroundColorHover: string
      fontSize: number
    }
    button: {
      zIndex: number
      font: string
      padding: number
      color: string
      backgroundColor: string
      colorHover: string
      backgroundColorHover: string
      fontSize: number
    }
    item: {
      zIndex: number
      font: string
      padding: number
      color: string
      backgroundColor: string
      colorHover: string
      backgroundColorHover: string
      height: number
      fontSize: number
    }
  }
  clickMenu: {
    zIndex: number
    backgroundColor: string
    disable: boolean
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
  history: { path: string; name: string }[]
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
    speed: number
    speedList: number[]
    playMode: PlayMode
  }
  state: {
    hide: boolean
    playlistHide: boolean
    historyHide: boolean
  }
  config: {
    fps: number
    enableMouseMoveEvent: boolean
    saveConfigThrottle: number
    protocolHook: string
  }
}

export const defaultTooltipMaxWidth = 64
export const defaultTooltipZIndex = 1024
export const defaultDropdownZIndex = 512
export const defaultToolbarZIndex = 256
export const defaultPreviewZIndex = 256
export const defaultClickMenuZIndex = 256
export const defaultVolumeZIndex = 128
export const defaultPlaylistZIndex = 512
export const defaultFont = "JetBrainsMono NFM Regular"
export const defaultFontSize = 48
export const defaultName = "uosc"
export const defaultPadding = 6
export const defaultButtonSize = defaultFontSize * 1.25
export const defaultCursorSize = 4
export const defaultMaxItemCount = 8
export const defaultVolumeStep = 10
export const defaultHideUIDelay = 5000
export const defaultSaveConfigThrottle = 2000
export const defaultSpeedSteps = [
  {
    delay: 500,
    speed: 2,
  },
  {
    delay: 2000,
    speed: 4,
  },
]
export function createDefaultThemeConfig(): EasyConfig {
  return structuredClone({
    mode: "dark",
    uiName: defaultName,
    history: [],
    style: {
      dark: {
        font: defaultFont,
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
          cursorSize: defaultCursorSize,
          previewCursorSize: defaultCursorSize,
          previewCursorColor: White + AlphaMedium,
          timeTextBackgroundColor: White + AlphaHide,
          timeTextColor: White + AlphaShow,
          font: defaultFont,
          previewZIndex: defaultPreviewZIndex,
        },
        control: {
          backgroundColor: Black + AlphaLow,
          height: defaultButtonSize,
        },
        scrollList: {
          maxItemCount: defaultMaxItemCount,
        },
        toolbar: {
          backgroundColor: Black + AlphaLow,
          autoHideDelay: defaultHideUIDelay,
          maxTitleLength: 48,
        },
        volume: {
          backgroundColor: Black + AlphaLow,
          autoHideDelay: defaultHideUIDelay,
          fontSize: defaultFontSize * 0.75,
          zIndex: defaultVolumeZIndex,
          step: defaultVolumeStep,
          previewCursorSize: defaultCursorSize,
          previewCursorColor: White + AlphaMedium,
        },
        speed: {
          showText: true,
          steps: defaultSpeedSteps,
        },
        playlist: {
          backgroundColor: Black + AlphaLow,
          zIndex: defaultPlaylistZIndex,
          maxTitleLength: 48,
        },
        history: {
          backgroundColor: Black + AlphaLow,
          zIndex: defaultPlaylistZIndex,
          maxTitleLength: 48,
          stackSize: 32,
        },
        tooltip: {
          enable: true,
          zIndex: defaultTooltipZIndex,
          padding: defaultPadding,
          color: White + AlphaShow,
          backgroundColor: Black + AlphaShow,
          fontSize: defaultFontSize * 0.75,
          font: defaultFont,
          maxWidth: defaultTooltipMaxWidth,
        },
        dropdown: {
          list: {
            padding: 0,
            color: White + AlphaShow,
            backgroundColor: Black + AlphaLow,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
            fontSize: defaultFontSize,
            font: defaultFont,
            zIndex: defaultDropdownZIndex + 1,
          },
          button: {
            padding: defaultPadding,
            color: White + AlphaShow,
            backgroundColor: Black + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
            fontSize: defaultFontSize,
            font: defaultFont,
            zIndex: defaultDropdownZIndex,
          },
          item: {
            padding: defaultPadding,
            color: White + AlphaShow,
            backgroundColor: Black + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
            fontSize: defaultFontSize * 0.75,
            font: defaultFont,
            zIndex: defaultDropdownZIndex + 2,
            height: defaultFontSize * 0.75,
          },
        },
        clickMenu: {
          backgroundColor: Black + AlphaLow,
          zIndex: defaultClickMenuZIndex,
          disable: DefaultClickMenuDisable,
        },
      },
      light: {
        font: defaultFont,
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
          cursorSize: defaultCursorSize,
          previewCursorSize: defaultCursorSize,
          previewCursorColor: Black + AlphaMedium,
          timeTextBackgroundColor: Black + AlphaHide,
          timeTextColor: Black + AlphaShow,
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
          maxTitleLength: 48,
        },
        scrollList: {
          maxItemCount: defaultMaxItemCount,
        },
        volume: {
          backgroundColor: White + AlphaLow,
          fontSize: defaultFontSize * 0.75,
          autoHideDelay: defaultHideUIDelay,
          step: defaultVolumeStep,
          zIndex: defaultVolumeZIndex,
          previewCursorSize: defaultCursorSize,
          previewCursorColor: Black + AlphaMedium,
        },
        speed: {
          showText: true,
          steps: defaultSpeedSteps,
        },
        playlist: {
          backgroundColor: White + AlphaLow,
          zIndex: defaultPlaylistZIndex,
          maxTitleLength: 48,
        },
        history: {
          backgroundColor: White + AlphaLow,
          zIndex: defaultPlaylistZIndex,
          maxTitleLength: 48,
          stackSize: 32,
        },
        tooltip: {
          enable: true,
          zIndex: defaultTooltipZIndex,
          padding: defaultPadding,
          color: Black + AlphaShow,
          backgroundColor: White + AlphaShow,
          fontSize: defaultFontSize * 0.75,
          font: defaultFont,
          maxWidth: defaultTooltipMaxWidth,
        },
        dropdown: {
          list: {
            padding: 0,
            color: Black + AlphaShow,
            backgroundColor: White + AlphaLow,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
            fontSize: defaultFontSize,
            font: defaultFont,
            zIndex: defaultDropdownZIndex + 1,
          },
          button: {
            padding: defaultPadding,
            color: Black + AlphaShow,
            backgroundColor: White + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
            fontSize: defaultFontSize,
            font: defaultFont,
            zIndex: defaultDropdownZIndex,
          },
          item: {
            padding: defaultPadding,
            color: Black + AlphaShow,
            backgroundColor: White + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
            fontSize: defaultFontSize * 0.75,
            font: defaultFont,
            zIndex: defaultDropdownZIndex + 2,
            height: defaultFontSize * 0.75,
          },
        },
        clickMenu: {
          backgroundColor: White + AlphaLow,
          zIndex: defaultClickMenuZIndex,
          disable: DefaultClickMenuDisable,
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
      fps: DefaultFps,
      enableMouseMoveEvent: true,
      saveConfigThrottle: defaultSaveConfigThrottle,
      protocolHook: "",
    },
  } satisfies EasyConfig)
}
export const defaultState: EasyConfig["state"] = {
  hide: false,
  playlistHide: true,
  historyHide: true,
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
  speed: 1,
  speedList: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4],
  playMode: DefaultPlayMode,
}
export const defaultConfig = createDefaultThemeConfig()
