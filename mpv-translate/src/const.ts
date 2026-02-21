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
  firstSubColor: string
  secondSubColor: string
  firstSubFontface: string
  secondSubFontface: string
  subOutputPath: string
  maxChunkChars: number
  maxChunkEncodeChars: number
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

export const DEFAULT_MAX_CHUNK_CHARS = 7500
export const DEFAULT_MAX_CHUNK_ENCODE_CHARS = 7500

export const defaultSubConfig: SubConfig = {
  subFontSize: 38,
  subColor: "#FFFFFF00",
  subBackColor: "#FFFFFFFF",
  subBackColorHover: "#000000BF",
  subColorHover: "#00FFFF00",
  subBold: false,
  subScale: 1,
  subOutlineSize: 0,
  subOutlineColor: "#FF000000",
  subZIndex: 512,
  targetLang: getLang(),
  sourceLang: "",
  subSrtScale: 0.6,
  firstSubColor: "",
  secondSubColor: "",
  firstSubFontface: "",
  secondSubFontface: "",
  subOutputPath: "",
  maxChunkChars: DEFAULT_MAX_CHUNK_CHARS,
  maxChunkEncodeChars: DEFAULT_MAX_CHUNK_ENCODE_CHARS,
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
  tooltipBottom: 32,
}
