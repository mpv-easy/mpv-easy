import { type MpDomProps, Box } from "@mpv-easy/react"
import React from "react"
import {
  buttonStyleSelector,
  controlStyleSelector,
  fontSelector,
  normalFontSizeSelector,
} from "../../store"
import { Previous } from "../components/previous"
import { Next } from "../components/next"
import { NextFrame } from "../components/next-frame"
import { PreviousFrame } from "../components/previous-frame"
import { useSelector } from "../../models"

export const OscInfo = ({ height }: Partial<MpDomProps>) => {
  const button = useSelector(buttonStyleSelector)
  const control = useSelector(controlStyleSelector)
  const fontSize = useSelector(normalFontSizeSelector)
  const font = useSelector(fontSelector)
  return (
    <Box
      id="osc-info"
      display="flex"
      font={font}
      fontSize={fontSize.fontSize}
      color={button.color}
      height={height}
      width={"100%"}
      flexDirection="column"
      justifyContent="start"
      alignItems="center"
      backgroundColor={control.backgroundColor}
    >
      <PreviousFrame />
      <Previous />
      <Next />
      <NextFrame />
    </Box>
  )
}
