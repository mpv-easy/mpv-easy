import {
  getProperty,
  readdir,
  alphaNumSort,
  isVideo,
  isAudio,
  isImage,
  joinPath,
  command,
} from "@mpv-easy/tool"
import { Box, Button, DOMElement } from "@mpv-easy/ui"
import React, { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  buttonStyleSelector,
  i18nSelector,
  mouseHoverStyleSelector,
  dropdownStyleSelector,
  Dispatch,
  playlistStyleSelector,
  playlistSelector,
  playlistHideSelector,
} from "../store"
import { RootNode } from "@mpv-easy/ui/src/render/flex"

export type PlaylistProps = {
  list: string[]
  current: number
}

export const Playlist = React.memo((props: Partial<PlaylistProps>) => {
  // const list = getList()
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
      {playlist.map((i) => (
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
          text={i.split("/").at(-1)}
          onClick={(e) => {
            // console.log("playlist click: ", i, playlist.indexOf(i))
            const index = playlist.indexOf(i)
            if (index >= 0) {
              command(`playlist-play-index ${index}`)
            }

            dispatch.context.setPlaylistHide(true)
            e.stopPropagation()
          }}
        ></Button>
      ))}
    </Box>
  )
})
