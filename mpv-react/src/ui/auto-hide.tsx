import React from "react"
import { useEffect, useRef, useState } from "react"
import { Box } from "./box"
import type { MpDomProps } from "../render"

export type PanelProps = {
  hideDelay: number
  showDelay: number
  children: React.ReactNode
  initHide: boolean
} & MpDomProps

export function AutoHide(props: Partial<PanelProps>) {
  const [hide, setHide] = useState(!!props.initHide)

  const hideHandle = useRef(-1)
  useEffect(() => {
    clearTimeout(hideHandle.current)

    hideHandle.current = +setTimeout(() => {
      setHide(true)
    }, props.hideDelay)
  }, [])

  return (
    <Box
      {...props}
      hide={hide}
      onMouseEnter={(e) => {
        props.onMouseEnter?.(e)
        clearTimeout(hideHandle.current)
        hideHandle.current = +setTimeout(() => {
          setHide(false)
        }, props.showDelay ?? 0)
      }}
      onMouseLeave={(e) => {
        clearTimeout(hideHandle.current)
        hideHandle.current = +setTimeout(() => {
          setHide(true)
        }, props.hideDelay ?? 0)
        props.onMouseLeave?.(e)
      }}
    >
      {props.children}
    </Box>
  )
}
