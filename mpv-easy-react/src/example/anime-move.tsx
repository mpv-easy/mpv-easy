import "@mpv-easy/polyfill"
import React from "react"
import { Box } from "@mpv-easy/react"
import { useSpring } from "@mpv-easy/anime"
export function AnimeMove() {
  const v = useSpring(10, 90, { duration: 5000, fps: 30 })
  return (
    <Box
      id="play-anime"
      width="100%"
      height="100%"
      display="flex"
      position="absolute"
      justifyContent="center"
      alignItems="center"
      onMouseDown={() => {
        v.restart()
      }}
    >
      {v.playing && (
        <Box
          left={`${v.value}%`}
          top={`${v.value}%`}
          fontSize={32}
          color="#00FF00"
          text={"⏹︎"}
        />
      )}
    </Box>
  )
}
