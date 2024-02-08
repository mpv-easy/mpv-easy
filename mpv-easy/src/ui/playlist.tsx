import { command, getFileName } from "@mpv-easy/tool"
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
  osdDimensionsSelector,
} from "../store"
import { RootNode } from "@mpv-easy/ui"
import { ScrollList } from "./components/scroll-list"

export type PlaylistProps = {
  list: string[]
  current: number
}

export const Playlist = React.memo(() => {
  const playlistStyle = useSelector(playlistStyleSelector)
  const dispatch = useDispatch<Dispatch>()
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
      hide={playlistHide}
      display="flex"
      position="relative"
      flexDirection="row"
      justifyContent="start"
      alignContent="stretch"
      alignItems="start"
      backgroundColor={playlistStyle.backgroundColor}
    >
      <ScrollList
        items={playlist.map((i) => {
          const prefix = i === path ? ICON.Ok : ICON.CheckboxBlankCircleOutline
          const label = prefix + " " + getFileName(i)
          return {
            key: i,
            label,
            onClick: (e) => {
              const index = playlist.indexOf(i)
              if (index >= 0) {
                command(`playlist-play-index ${index}`)
                dispatch.context.setPath(playlist[index])
              }
              dispatch.context.setPlaylistHide(true)
              e.stopPropagation()
            },
          }
        })}
      />
    </Box>
  )
})
