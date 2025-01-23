import { Box } from "@mpv-easy/react"
import React, { useRef, useState } from "react"
import { fontSelector, fontSizeSelector, speedStyleSelector } from "../store"
import * as ICON from "../icon"
import { usePropertyNumber } from "@mpv-easy/react"
import { useSelector } from "../models"

export function Speed() {
  const style = useSelector(speedStyleSelector)
  const [speed, setSpeed] = usePropertyNumber("speed", 1)
  const [press, setPress] = useState(false)
  const font = useSelector(fontSelector)
  const handleList = useRef<number[]>([])
  const initSpeed = useRef(speed)
  const lastClickRef = useRef(0)
  const fontSize = useSelector(fontSizeSelector)

  const clear = () => {
    for (const hd of handleList.current) {
      clearTimeout(hd)
    }
    setPress(false)
    if (speed !== initSpeed.current) {
      setSpeed(initSpeed.current)
    }
  }
  return (
    <Box
      id="mpv-easy-speed"
      position="absolute"
      display="flex"
      width={"100%"}
      height={"100%"}
      justifyContent="center"
      alignItems="center"
      font={font}
      fontSize={fontSize.fontSize}
      onMouseDown={() => {
        clear()
        const now = Date.now()
        const dur = now - lastClickRef.current
        const doubleClickDuration = 500
        // FIXME: avoid double click
        if (!press && dur > doubleClickDuration) {
          lastClickRef.current = now
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
        clear()
      }}
      onClick={() => {
        clear()
      }}
    >
      {style.showText && press && (
        <Box
          id="mpv-easy-speed-text"
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
          text={`${ICON.Forward}x${speed}`}
        />
      )}
    </Box>
  )
}
