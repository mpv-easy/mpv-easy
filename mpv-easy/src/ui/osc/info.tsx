import { BaseElementProps, Box } from "@mpv-easy/ui"
import React from "react"
import { useSelector } from "react-redux"
import { buttonStyleSelector, controlStyleSelector } from "../../store"
import { Previous } from "../components/previous"
import { Next } from "../components/next"
import { Filename } from "../components/filename"

export const Info = React.memo(({ height }: Partial<BaseElementProps>) => {
  const button = useSelector(buttonStyleSelector)
  const control = useSelector(controlStyleSelector)
  return (
    <Box
      id="osc-info"
      display="flex"
      font={button.font}
      fontSize={button.fontSize}
      color={button.color}
      height={height}
      width={"100%"}
      flexDirection="column"
      justifyContent="start"
      alignItems="center"
      backgroundColor={control.backgroundColor}
    >
      <Previous />
      <Next />
      <Filename />
    </Box>
  )
})
