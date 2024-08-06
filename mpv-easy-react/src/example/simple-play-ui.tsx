import { usePropertyBool } from "@mpv-easy/hook"
import { PropertyBool } from "@mpv-easy/tool"
import { Button } from "@mpv-easy/react"
import * as ICON from "../icon"
import React, { useEffect, useState } from "react"

const pauseProp = new PropertyBool("pause")
const iconColor = "00FF00"
const iconHoverColor = "00FFFF"
const pauseIcon = ICON.Pause
const playIcon = ICON.Play

export function SimplePlay() {
  const [pause, setPause] = usePropertyBool("pause", pauseProp.value)
  const [color, setColor] = useState(iconColor)
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
        setColor(iconHoverColor)
      }}
      onMouseLeave={() => {
        setColor(iconColor)
      }}
      font="JetBrainsMono NFM Regular"
      fontSize={64}
      color={color}
      text={!pause ? pauseIcon : playIcon}
    />
  )
}
