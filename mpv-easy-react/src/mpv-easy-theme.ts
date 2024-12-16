import type { MousePos, Rect, VideoParams } from "@mpv-easy/tool"
import { DefaultFps } from "@mpv-easy/react"
import { cloneDeep } from "lodash-es"

const White = "#FFFFFF"
const Black = "#000000"
const Gray = "#D3D3D3"
const Yellow = "#00FFFF"
const Green = "#00FF00"

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
export const DefaultFontSizeScale = 1
export type ButtonStyle = {
  color: string
  backgroundColor: string
  colorHover: string
  backgroundColorHover: string
}
export type ThemeStyle = {
  font: string
  fontSizeScale: number
  button: {
    default: ButtonStyle
    active: ButtonStyle
    hover: ButtonStyle
  }

  progress: {
    color: string
    backgroundColor: string
    cursorColor: string
    cursorSize: number
    previewCursorSize: number
    previewCursorColor: string
    timeTextBackgroundColor: string
    timeTextColor: string
    previewZIndex: number
    cutCursorColor: string
    cutSegmentColor: string
  }

  control: {
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
    color: string
    backgroundColor: string
    maxWidth: number
  }
  dropdown: {
    list: {
      zIndex: number
      color: string
      backgroundColor: string
      colorHover: string
      backgroundColorHover: string
    }
    button: {
      zIndex: number
      color: string
      backgroundColor: string
      colorHover: string
      backgroundColorHover: string
    }
    item: {
      zIndex: number
      color: string
      backgroundColor: string
      colorHover: string
      backgroundColorHover: string
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
    "playlist-play-index": number
    seekable: boolean
    "sub-scale": number
    pause: boolean
    "time-pos": number
    duration: number
    "window-maximized": boolean
    fullscreen: boolean
    "window-minimized": boolean
    path: string
    "mouse-pos": MousePos
    mute: boolean
    "osd-dimensions": {
      w: number
      h: number
      aspect: number
      mb: number
      ml: number
      mr: number
      mt: number
      par: number
    }
    playlist: string[]
    aid: number
    vid: number
    sid: number
    "video-params": VideoParams
    volume: number
    "volume-max": number
    speed: number
    speedList: number[]
    playMode: PlayMode
  }
  state: {
    hide: boolean
    playlistHide: boolean
    historyHide: boolean
    cutPoints: number[]
    cropPoints: [number, number][]
    showCrop: boolean
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
export const defaultName = "uosc"
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
  return cloneDeep({
    mode: "dark",
    uiName: defaultName,
    history: [],
    style: {
      dark: {
        fontSizeScale: DefaultFontSizeScale,
        font: defaultFont,
        button: {
          default: {
            color: White + AlphaShow,
            backgroundColor: Black + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
          },
          active: {
            color: White + AlphaShow,
            backgroundColor: Black + AlphaLow,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
          },
          hover: {
            color: White + AlphaShow,
            backgroundColor: Black + AlphaLow,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
          },
        },
        progress: {
          color: White + AlphaShow,
          backgroundColor: Black + AlphaLow,
          cursorColor: White + AlphaShow,
          cursorSize: defaultCursorSize,
          previewCursorSize: defaultCursorSize,
          previewCursorColor: White + AlphaMedium,
          timeTextBackgroundColor: White + AlphaHide,
          timeTextColor: White + AlphaShow,
          previewZIndex: defaultPreviewZIndex,
          cutSegmentColor: Green + AlphaLow,
          cutCursorColor: Green + AlphaShow,
        },
        control: {
          backgroundColor: Black + AlphaLow,
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
          color: White + AlphaShow,
          backgroundColor: Black + AlphaShow,
          maxWidth: defaultTooltipMaxWidth,
        },
        dropdown: {
          list: {
            color: White + AlphaShow,
            backgroundColor: Black + AlphaLow,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
            zIndex: defaultDropdownZIndex + 1,
          },
          button: {
            color: White + AlphaShow,
            backgroundColor: Black + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
            zIndex: defaultDropdownZIndex,
          },
          item: {
            color: White + AlphaShow,
            backgroundColor: Black + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: White + AlphaMedium,
            zIndex: defaultDropdownZIndex + 2,
          },
        },
        clickMenu: {
          backgroundColor: Black + AlphaLow,
          zIndex: defaultClickMenuZIndex,
          disable: DefaultClickMenuDisable,
        },
      },
      light: {
        fontSizeScale: DefaultFontSizeScale,
        font: defaultFont,
        button: {
          default: {
            color: Black + AlphaShow,
            backgroundColor: White + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
          },
          active: {
            color: Black + AlphaShow,
            backgroundColor: White + AlphaLow,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
          },
          hover: {
            color: Black + AlphaShow,
            backgroundColor: White + AlphaLow,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
          },
        },
        progress: {
          color: Black + AlphaShow,
          backgroundColor: White + AlphaLow,
          cursorColor: Black + AlphaShow,
          cursorSize: defaultCursorSize,
          previewCursorSize: defaultCursorSize,
          previewCursorColor: Black + AlphaMedium,
          timeTextBackgroundColor: Black + AlphaHide,
          timeTextColor: Black + AlphaShow,
          previewZIndex: defaultPreviewZIndex,
          cutSegmentColor: Green + AlphaLow,
          cutCursorColor: Green + AlphaShow,
        },
        control: {
          backgroundColor: White + AlphaLow,
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
          color: Black + AlphaShow,
          backgroundColor: White + AlphaShow,
          maxWidth: defaultTooltipMaxWidth,
        },
        dropdown: {
          list: {
            color: Black + AlphaShow,
            backgroundColor: White + AlphaLow,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
            zIndex: defaultDropdownZIndex + 1,
          },
          button: {
            color: Black + AlphaShow,
            backgroundColor: White + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
            zIndex: defaultDropdownZIndex,
          },
          item: {
            color: Black + AlphaShow,
            backgroundColor: White + AlphaHide,
            colorHover: Yellow + AlphaShow,
            backgroundColorHover: Black + AlphaMedium,
            zIndex: defaultDropdownZIndex + 2,
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
  cutPoints: [],
  cropPoints: [],
  showCrop: false,
}

export const defaultPlayer: EasyConfig["player"] = {
  "playlist-play-index": 0,
  pause: false,
  seekable: false,
  "sub-scale": 1,
  "time-pos": 0,
  duration: 0,
  "window-maximized": false,
  fullscreen: false,
  "window-minimized": false,
  path: "",
  mute: false,
  "mouse-pos": {
    x: 0,
    y: 0,
    hover: false,
  },
  "osd-dimensions": {
    w: 0,
    h: 0,
    aspect: 0,
    mb: 0,
    ml: 0,
    mr: 0,
    mt: 0,
    par: 0,
  },
  aid: 0,
  vid: 0,
  sid: 0,
  playlist: [],
  "video-params": {} as any,
  volume: 100,
  "volume-max": 130,
  speed: 1,
  speedList: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4],
  playMode: DefaultPlayMode,
}
export const defaultConfig = createDefaultThemeConfig()
