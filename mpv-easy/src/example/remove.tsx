import { Box, render } from "@mpv-easy/ui"
import React, { useEffect, useState } from "react"

export const Remove = () => {
  const [show, setShow] = useState(true)
  useEffect(() => {
    setInterval(() => {
      setShow((c) => !c)
    }, 1000)
  }, [])

  console.log("===remove", show)
  return show ? (
    <Box
      id="tooltip"
      width={100}
      height={100}
      backgroundColor={show ? "00FFFF" : "00FF00"}
    />
  ) : (
    <></>
  )
}

render(
  <Box
    id="remove-main"
    width={"100%"}
    height={"100%"}
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
    <Remove />

    <Box id="tooltip" width={100} height={100} backgroundColor={"FFFFFF"} />
  </Box>,
)
