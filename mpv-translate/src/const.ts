import { getLang } from "@mpv-easy/tool"

export type SubConfig = {
  subFontSize: number
  subColor: string
  subBackColor: string
  subBackColorHover: string
  subColorHover: string
  subBold: boolean
  subScale: number
  subOutlineSize: number
  subOutlineColor: string
  subZIndex: number
  targetLang: string
  sourceLang: string
  subSrtScale: number
}
export type TooltipConfig = {
  tooltioFontSize: number
  tooltipColor: string
  tooltipBackColor: string
  tooltipScale: number
  tooltipBold: boolean
  tooltipOutlineSize: number
  tooltipOutlineColor: string
  tooltipZIndex: number
  tooltipLeft: number
  tooltipBottom: number
  tooltipMaxWidth: number
}

export const defaultSubConfig: SubConfig = {
  subFontSize: 55,
  subColor: "#FFFFFF00",
  subBackColor: "#FFFFFFFF",
  subBackColorHover: "#000000BF",
  subColorHover: "#00FFFF00",
  subBold: true,
  subScale: 1,
  subOutlineSize: 0,
  subOutlineColor: "#FF000000",
  subZIndex: 512,
  targetLang: getLang(),
  sourceLang: "",
  subSrtScale: 2.5,
}

export const defaultTooltipConfig: TooltipConfig = {
  tooltioFontSize: 32,
  tooltipColor: "#FFFFFF00",
  tooltipBackColor: "#00000000",
  tooltipScale: 1,
  tooltipBold: false,
  tooltipOutlineSize: 0,
  tooltipOutlineColor: "#00000000",
  tooltipMaxWidth: 64,
  tooltipZIndex: 1024,
  tooltipLeft: 0,
  tooltipBottom: 0,
}
