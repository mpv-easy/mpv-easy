import { PropertyBool, command, observeProperty } from "@mpv-easy/tool"
import { Box, Button, Dropdown, render } from "@mpv-easy/ui"
import * as ICON from "firacode-icon"
import React, { useEffect, useState } from "react"

command("set osc no")

const White = "FFFFFF"
const Gray = "cccccc"
const Black = "000000"
const Yellow = "00FFFF"

const boxSize = 200
const padding = 10
function Counter() {
  const [count, setCount] = useState(0)

  console.log("============count: ", count)
  return (
    <Box
      id="counter-main"
      font="FiraCode Nerd Font Mono Reg"
      fontSize={boxSize / 4}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width={"100%"}
      height={"100%"}
    >
      <Dropdown
        direction="bottom"
        id="dropdown-1"
        text={ICON.Minus}
        onMouseDown={() => {
          console.log("minus: ", count)
          setCount((c) => --c)
        }}
        items={[
          {
            key: "A",
            label: "A",
            selected: false,
            onSelect: () => {
              console.log("A")
            },
          },
          {
            key: "B",
            label: "B",
            selected: true,
            onSelect: () => {
              console.log("B")
            },
          },
          {
            key: "C",
            label: "C",
            selected: false,
            onSelect: () => {
              console.log("C")
            },
          },
        ]}
        height={boxSize}
        width={boxSize}
        backgroundColor={Gray}
        backgroundColorHover={White}
        color={Black}
        colorHover={Yellow}
        display="flex"
        justifyContent="center"
        alignItems="center"
      />
    </Box>
  )
}

render(<Counter />)
