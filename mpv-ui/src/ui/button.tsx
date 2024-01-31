import { clone, setMouseStyle } from "@mpv-easy/tool"
import React, { useState } from "react"
import { BaseElementProps, Len } from "../type"
import { Box } from "./box"
import { DOMElement } from "../render"

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
  enableMouseStyle: boolean
} & BaseElementProps

export const ButtonState = ["hover", "active", "disable"] as const

function isHoverName(s: string) {
  return s.endsWith("Hover")
}

function getHoverName(s: string) {
  return s.slice(0, -5)
}

function getHoverProps(props: any) {
  const newProps: any = {}
  for (const i in props) {
    const name = getHoverName(i)
    const v = props[i]
    if (isHoverName(i)) {
      newProps[name] = v
    }
  }
  return newProps
}

export const Button = React.forwardRef<DOMElement, Partial<ButtonProps>>(
  (props, ref) => {
    const hoverProps = getHoverProps(props)
    const [hover, setHover] = useState(false)
    return (
      <Box
        {...props}
        {...(hover ? hoverProps : {})}
        ref={ref}
        onMouseEnter={(e) => {
          setHover(true)
          console.log("enter: ", hover, props.color, hoverProps.color)
          if (props.enableMouseStyle) {
            setMouseStyle("Hand")
          }
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          setHover(false)
          console.log("leave: ", hover, props.color, hoverProps.color)
          if (props.enableMouseStyle) {
            setMouseStyle("Arrow")
          }
          props.onMouseLeave?.(e)
        }}
      />
    )
  },
)
