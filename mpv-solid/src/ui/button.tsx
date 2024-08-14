import { setMouseStyle } from "@mpv-easy/tool"
import { createSignal } from "solid-js"
import { Box } from "./box"
import type { MpDom, MpDomProps } from "@mpv-easy/flex"

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

  children: any

  tooltip: string
  tooltipDelay: number
  enableMouseStyle: boolean

  prefix: string
  postfix: string
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

export const Button = ({
  prefix,
  postfix,
  text,
  ...props
}: Partial<ButtonProps> = {}) => {
  const hoverProps = () => (hover() ? getHoverProps(props) : {})
  const [hover, setHover] = createSignal(false)

  return (
    <Box
      display="flex"
      {...props}
      {...hoverProps()}
      // ref={ref}
      // onMouseDown={(e) => {
      //   props.onMouseDown?.(e)
      // }}
      onMouseEnter={(e) => {
        console.log("onMouseEnter", e, JSON.stringify(hoverProps()))
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
    >
      {prefix && (
        <Box
          id={`button-prefix-${props.id}`}
          pointerEvents="none"
          text={prefix}
        />
      )}
      {text && (
        <Box id={`button-text-${props.id}`} pointerEvents="none" text={text} />
      )}
      {postfix && (
        <Box
          id={`button-postfix-${props.id}`}
          pointerEvents="none"
          text={postfix}
        />
      )}
      {props.children}
    </Box>
  )
}
