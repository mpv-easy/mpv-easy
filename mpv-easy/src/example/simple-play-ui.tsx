import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Button, render } from "@mpv-easy/ui"
import { AssColor } from "e-color"
import * as ICON from "../icon"
import React, { useEffect, useState } from "react"

command("set osc no")
command("set window-dragging no")

const pauseProp = new PropertyBool("pause")
function Play() {
  const pauseIcon = ICON.Pause
  const playIcon = ICON.Play
  const [pause, setPause] = usePropertyBool("pause", pauseProp.value)
  const iconColor = AssColor.Colors.Black
  const iconHoverColor = AssColor.Colors.Yellow
  const [color, setColor] = useState(iconColor.toHex())

  useEffect(() => {
    pauseProp.observe((v) => {
      console.log("pause change: ", v)
    })
  }, [])

  return (
    <Button
      onMouseDown={() => {
        setPause(!pause)
      }}
      onMouseEnter={() => {
        setColor(iconHoverColor.toHex())
      }}
      onMouseLeave={() => {
        setColor(iconColor.toHex())
      }}
      font="FiraCode Nerd Font Mono Reg"
      fontSize={64}
      color={color}
      text={!pause ? pauseIcon : playIcon}
    />
  )
}

render(<Play />)
