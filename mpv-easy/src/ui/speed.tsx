import { Box } from "@mpv-easy/ui"
import React, { useRef, useState, useLayoutEffect, useEffect } from "react"
import { useSelector } from "react-redux"
import { fontSelector, speedStyleSelector } from "../store"
import * as ICON from "../icon"
import { usePropertyNumber } from "@mpv-easy/hook"

export function Speed() {
  const style = useSelector(speedStyleSelector)
  const [speed, setSpeed] = usePropertyNumber("speed", 1)
  const [press, setPress] = useState(false)
  const font = useSelector(fontSelector)
  const handleList = useRef<number[]>([])
  const initSpeed = useRef(1)
  return (
    <Box
      id="speed"
      position="absolute"
      display="flex"
      width={"100%"}
      height={"100%"}
      justifyContent="center"
      alignItems="center"
      font={font}
      onMouseDown={() => {
        if (!press) {
          initSpeed.current = speed
          handleList.current = style.steps.map(
            (i) =>
              +setTimeout(() => {
                setPress(true)
                setSpeed(i.speed)
              }, i.delay),
          )
        }
      }}
      onMouseUp={() => {
        for (const hd of handleList.current) {
          clearTimeout(hd)
        }
        setPress(false)
        setSpeed(initSpeed.current)
      }}
    >
      {style.showText && press && (
        <Box
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
          left={"50%"}
          top={"50%"}
          text={`${ICON.Forward}x${speed}`}
        />
      )}
    </Box>
  )
}
