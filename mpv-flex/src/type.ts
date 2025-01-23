import { BaseDom } from "./dom"

export type Len = number | string
export type TextAlign = "center" | "left" | "right"
export type FlexDirection = "row" | "column"
export type Position = "relative" | "absolute"
export type AlignType = "center" | "start" | "end" | "space-between"
export type AlignContent = "stretch"
export type FlexWrap = "wrap" | "nowrap"
export type WordBreak = "break-word" | "break-all"
export type BaseDomProps<T extends BaseDom> = T["attributes"]
