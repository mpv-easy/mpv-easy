import { clone, setMouseStyle } from "@mpv-easy/tool"
import React from "react"
import { BaseElementProps, Len } from "../type"
import { Box } from "./box"

export type ButtonCustomProp =
  | "color"
  | "backgroundColor"
  | "borderColor"
  | "text"
export type ButtonCustomPropHover = `${ButtonCustomProp}Hover`
export type ButtonCustomPropDisable = `${ButtonCustomProp}Disable`
export type ButtonCustomPropActive = `${ButtonCustomProp}Active`

export type ButtonProps = {
  [x in
    | ButtonCustomPropActive
    | ButtonCustomPropHover
    | ButtonCustomPropDisable]: string
} & {
  // borderSizeHover: Len
  // widthHover: Len
  // heightHover: Len
  // textHover: string

  disable: boolean
  active: boolean

  children: React.ReactNode

  tooltip: string
  tooltipDelay: number
  tooltipPosition:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topLeft"
    | "topRight"
    | "leftTop"
    | "rightTop"
    | "leftBottom"
    | "rightBottom"
    | "bottomLeft"
    | "bottomRight"

  enableMouseStyle: boolean
} & BaseElementProps

export const ButtonState = ["hover", "active", "disable"] as const
function mergeProp(boxProp: any, buttonProp: any) {
  const newProps = { ...boxProp }
  for (const i in buttonProp) {
    const v = buttonProp[i]
    if (i.endsWith("Hover")) {
      const name = i.slice(0, -5)
      newProps[name] = buttonProp[name]
    }
  }

  return newProps
}
export function Button(props: Partial<ButtonProps>) {
  const update = React.useReducer((c) => ++c, 0)[1]
  const rawProps = React.useRef({ ...props })
  const buttonProps = React.useRef({ ...props })
  return (
    <Box
      {...mergeProp(props, buttonProps.current)}
      onMouseEnter={(e) => {
        let needRender = false
        for (const i in rawProps.current) {
          if (i.endsWith("Hover")) {
            const name = i.slice(0, -5)
            const oldValue = (buttonProps.current as any)[name]
            const hoverValue = (rawProps.current as any)[i] as any
            if (oldValue !== hoverValue) {
              needRender = true
              ;(buttonProps.current as any)[name] = hoverValue
            }
          }
        }
        if (needRender) {
          update()
        }

        if (props.enableMouseStyle) {
          setMouseStyle("Hand")
        }
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        let needRender = false
        for (const i in rawProps.current) {
          if (i.endsWith("Hover")) {
            const name = i.slice(0, -5)
            const oldValue = (rawProps.current as any)[name]
            const hoverValue = (rawProps.current as any)[i]
            if (oldValue !== hoverValue) {
              needRender = true
              ;(buttonProps.current as any)[name] = oldValue
            }
          }
        }
        if (needRender) {
          update()
        }
        if (props.enableMouseStyle) {
          setMouseStyle("Arrow")
        }
        props.onMouseLeave?.(e)
      }}
    />
  )
}
