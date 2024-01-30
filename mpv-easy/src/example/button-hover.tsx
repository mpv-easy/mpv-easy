import { command, setMouseStyle } from "@mpv-easy/tool"
import { Button, render } from "@mpv-easy/ui"
import * as ICON from "../icon"
import React, { useState } from "react"

command("set osc no")
command("set window-dragging no")

function ButtonHover() {
  const [count, setCount] = useState(0)
  console.log("============count: ", count)
  return (
    <Button
      id="1"
      font="FiraCode Nerd Font Mono Reg"
      backgroundColor="000000"
      backgroundColorHover="00FF00"
      fontSize={64}
      width={500}
      height={500}
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

render(<ButtonHover />)
