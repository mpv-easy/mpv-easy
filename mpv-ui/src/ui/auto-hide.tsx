import React, { useEffect, useRef, useState } from "react"
import { BaseElementProps } from "../type"
import { Box } from "./box"

export type PanelProps = {
  hideDelay: number
  showDelay: number
  children: React.ReactNode
  initHide: boolean
} & BaseElementProps

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
        setTimeout(() => {
          setHide(false)
        }, props.showDelay ?? 0)
      }}
      onMouseLeave={(e) => {
        setTimeout(() => {
          setHide(true)
        }, props.hideDelay ?? 0)
        props.onMouseLeave?.(e)
      }}
    >
      {props.children}
    </Box>
  )
}
