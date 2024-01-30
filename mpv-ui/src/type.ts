import { MouseEvent } from "./render/dom"

export type Len = number | string

export type MouseCb = (event: MouseEvent) => void

export type KeyEvent = { key: string }

export type KeyCb = (event: KeyEvent) => void

export type TextAlign = "center" | "left" | "right"

export type FlexDirection = "row" | "column"

export type Position = "relative" | "absolute"
export type AlignType = "center" | "start" | "end"
// | "flex-start"
// | "flex-end"
// | "space-around"
// | "space-between"

export type FlexWrap = "wrap" | "nowrap"

export type BaseElementProps = {
  id: string | number
  position: Position
  ref: any
  x: Len
  y: Len
  width: Len
  height: Len
  left: Len
  right: Len
  top: Len
  bottom: Len
  backgroundColor: string
  borderSize: Len
  borderColor: string
  borderRadius: Len
  font: string
  fontBorderColor: string
  fontBorderSize: number
  fontSize: Len
  textAlign: TextAlign
  text: string
  flexDirection: FlexDirection
  flexWrap: FlexWrap
  justifyContent: AlignType
  alignItems: AlignType
  padding: Len
  onClick: MouseCb
  onMouseDown: MouseCb
  onMouseUp: MouseCb
  onMouseMove: MouseCb
  onMousePress: MouseCb
  onMouseEnter: MouseCb
  onMouseLeave: MouseCb
  color: string
  zIndex: number
  hide: boolean
  display: "flex"
}
