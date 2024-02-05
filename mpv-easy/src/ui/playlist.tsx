import { command } from "@mpv-easy/tool"
import { Box, Button, DOMElement } from "@mpv-easy/ui"
import React, { useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as ICON from "../icon"
import {
  buttonStyleSelector,
  mouseHoverStyleSelector,
  Dispatch,
  playlistStyleSelector,
  playlistSelector,
  playlistHideSelector,
  pathSelector,
} from "../store"
import { RootNode } from "@mpv-easy/ui"

export type PlaylistProps = {
  list: string[]
  current: number
}

export const Playlist = React.memo((props: Partial<PlaylistProps>) => {
  const button = useSelector(buttonStyleSelector)
  const playlistStyle = useSelector(playlistStyleSelector)
  const dispatch = useDispatch<Dispatch>()
  const mouseHoverStyle = useSelector(mouseHoverStyleSelector)
  const playlist = useSelector(playlistSelector)
  const playlistRef = useRef<DOMElement>(null)
  const playlistHide = useSelector(playlistHideSelector)
  let x = 0
  let y = 0
  if (playlistRef.current) {
    const rootW = RootNode.layoutNode.width
    const rootH = RootNode.layoutNode.height
    const w = playlistRef.current.layoutNode.width
    const h = playlistRef.current.layoutNode.height
    x = (rootW - w) / 2
    y = (rootH - h) / 2
  }

  const path = useSelector(pathSelector)

  return (
    <Box
      id={"playlist-main"}
      ref={playlistRef}
      x={x}
      y={y}
      display="flex"
      position="relative"
      flexDirection="row"
      justifyContent="start"
      alignContent="stretch"
      alignItems="start"
      backgroundColor={playlistStyle.backgroundColor}
      hide={playlistHide}
    >
      {playlist.map((i) => {
        const prefix = i === path ? ICON.Ok : ICON.CheckboxBlankCircleOutline
        const text = prefix + " " + i.split("/").at(-1)
        return (
          <Button
            id={"playlist-item-" + i}
            key={i}
            enableMouseStyle={mouseHoverStyle}
            padding={button.padding}
            colorHover={button.colorHover}
            backgroundColorHover={button.backgroundColorHover}
            backgroundColor={button.backgroundColor}
            font={button.font}
            fontSize={button.fontSize}
            color={button.color}
            text={text}
            onClick={(e) => {
              const index = playlist.indexOf(i)
              if (index >= 0) {
                command(`playlist-play-index ${index}`)
              }

              dispatch.context.setPlaylistHide(true)
              e.stopPropagation()
            }}
          ></Button>
        )
      })}
    </Box>
  )
})
