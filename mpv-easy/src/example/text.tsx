import { command } from "@mpv-easy/tool"
import { Box, render } from "@mpv-easy/ui"
import * as ICON from "../icon"
import React from "react"

// const TEXT = [
//   "a",
//   "b",
//   "c",
//   "d",
//   "e",
//   "f",
//   "g",
//   "h",
//   "i",
//   "j",
//   "k",
//   "l",
//   "m",
//   "n",
//   "o",
//   "p",
//   "q",
//   "r",
//   "s",
//   "t",
//   "u",
//   "v",
//   "w",
//   "x",
//   "y",
//   "z",
//   "A",
//   "B",
//   "C",
//   "D",
//   "E",
//   "F",
//   "G",
//   "H",
//   "I",
//   "J",
//   "K",
//   "L",
//   "M",
//   "N",
//   "O",
//   "P",
//   "Q",
//   "R",
//   "S",
//   "T",
//   "U",
//   "V",
//   "W",
//   "X",
//   "Y",
//   "Z",
//   "1",
//   "2",
//   "3",
//   "4",
//   "5",
//   "6",
//   "7",
//   "8",
//   "9",
//   "0",
//   "!",
//   "@",
//   "$",
//   "%",
//   "^",
//   "&",
//   "*",
//   "(",
//   ")",
//   "-",
//   "_",
//   "=",
//   "+",
//   "[",
//   "]",
//   "{",
//   "}",
//   "\\",
//   "|",
//   ";",
//   ":",
//   '"',
//   ",",
//   ".",
//   "<",
//   ">",
//   "/",
//   "?",
//   "`",
//   "~",
// ]
const TEXT = '󰐑󰐐󰨖󰋚'.split('')
// const TEXT = ''.split('')
export function TextBox() {
  return (
    <>
      {/* <Box
        position={'absolute'}
        x={200} y={200} fontSize={128} text="ABCD" backgroundColor="FF00FF" />
         */}
      {/* <Box fontSize={64} text="EFG" backgroundColor="FF0000" /> */}

      <Box
        display="flex"
      // alignContent="stretch"
      >
        {TEXT.map((_, k) => (
          <Box
            id={k.toString()}
            key={k}
            text={TEXT[k]}
            font="FiraCode Nerd Font Mono Reg"
            backgroundColor="FF0000"
            color="00FF00"
            display="flex"
            fontSize={64}
            // height={"100%"}
            alignContent="stretch"
          />
        ))}
      </Box>

      {/* <Box fontSize={64} id="-0+1111" backgroundColor="FF00FF">
        <Box text="-" id="t1111111111111" />
      </Box>
      <Box fontSize={64} backgroundColor="FF00FF" id="-0+2222">
        <Box text="+" id="t22222222222" />
      </Box>
      <Box fontSize={64} backgroundColor="FF00FF" id="-0+3333">
        <Box text="*" id="t3333333" />
      </Box>
      <Box
        fontSize={64}
        backgroundColor="FF00FF"
        font="FiraCode Nerd Font Mono Reg"
        id="-0+3333"
      >
        <Box text={ICON.Pause} id="t3333333" />
      </Box>
      <Box
        fontSize={64}
        font="FiraCode Nerd Font Mono Reg"
        backgroundColor="FF00FF"
        id="-0+3333"
      >
        <Box text={ICON.Play} id="t3333333" />
      </Box>
      <Box
        fontSize={64}
        font="FiraCode Nerd Font Mono Reg"
        backgroundColor="FF00FF"
        id="-0+3333"
      >
        <Box text={ICON.Stop} id="t3333333" />
      </Box>
      <Box
        fontSize={64}
        font="FiraCode Nerd Font Mono Reg"
        backgroundColor="FF00FF"
        id="-0+3333"
      >
        <Box text={ICON.Minus} id="t3333333" />
      </Box>
      <Box
        fontSize={64}
        font="FiraCode Nerd Font Mono Reg"
        backgroundColor="FF00FF"
        id="-0+3333"
      >
        <Box text={ICON.Plus} id="t3333333" />
      </Box>

      <Box
        fontSize={16}
        text={TEXT.join("")}
        font="FiraCode Nerd Font Mono Reg"
        backgroundColor="FF00FF"
        id="-0+6555"
      /> */}
    </>
  )
}
