import { setMouseStyle } from "@mpv-easy/tool"
import React, { useState } from "react"
import { Box } from "./box"
import type { MpDom, MpDomProps } from "../flex"

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
  disable: boolean
  active: boolean

  children: React.ReactNode

  tooltip: string
  tooltipDelay: number
  enableMouseStyle: boolean
} & MpDomProps

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

export const Button = React.forwardRef<MpDom, Partial<ButtonProps>>(
  ({ text, ...props }, ref) => {
    const hoverProps = getHoverProps(props)
    const [hover, setHover] = useState(false)

    return (
      <Box
        {...props}
        {...(hover ? hoverProps : {})}
        ref={ref}
        onMouseDown={(e) => {
          props.onMouseDown?.(e)
        }}
        onMouseEnter={(e) => {
          setHover(true)
          if (props.enableMouseStyle) {
            setMouseStyle("Hand")
          }
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          setHover(false)
          if (props.enableMouseStyle) {
            setMouseStyle("Arrow")
          }
          props.onMouseLeave?.(e)
        }}
        text={text}
      />
    )
  },
)
