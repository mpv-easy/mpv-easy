import { command, setMouseStyle } from "@mpv-easy/tool"
import { Button, render } from "@mpv-easy/react"
import * as ICON from "../icon"
import React, { useState } from "react"

command("set osc no")
command("set window-dragging no")

export function ButtonHover() {
  const [count, setCount] = useState(0)
  console.log("============count: ", count)
  return (
    <Button
      id="1"
      font="JetBrainsMono NFM Regular"
      backgroundColor="000000"
      backgroundColorHover="00FF00"
      fontSize={128}
      width={500}
      height={500}
      display="flex"
      justifyContent="center"
      alignItems="center"
      color="FFFFFF"
    >
      <Button
        enableMouseStyle={true}
        text={ICON.Minus}
        id="2"
        onMouseDown={() => {
          console.log("minus: ", count)
          setMouseStyle("Arrow")
          setCount((c) => --c)
        }}
        backgroundColor="000000"
        backgroundColorHover="FFFFFF"
        colorHover="00FFFF"
      />
      <Button
        id="3"
        text={count.toString()}
        backgroundColor="000000"
        backgroundColorHover="FFFFFF"
        colorHover="00FFFF"
      />
      <Button
        enableMouseStyle={true}
        id="4"
        backgroundColor="000000"
        backgroundColorHover="FFFFFF"
        colorHover="00FFFF"
        color="FFFFFF"
        onMouseDown={() => {
          setMouseStyle("Hand")
          console.log("plus: ", count)
          setCount((c) => ++c)
        }}
        text={ICON.Plus}
      />
    </Button>
  )
}
