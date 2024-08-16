import { Box, Dropdown } from "@mpv-easy/react"
import * as ICON from "../icon"
import React, { useState } from "react"

const White = "#FFFFFF"
const Gray = "#cccccc"
const Black = "#000000"
const Yellow = "#00FFFF"

const boxSize = 200
export function DropdownBox() {
  const [count, setCount] = useState(0)

  console.log("============count: ", count)
  return (
    <Box
      id="counter-main"
      font="JetBrainsMono NFM Regular"
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
            label: "B".repeat(20),
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
