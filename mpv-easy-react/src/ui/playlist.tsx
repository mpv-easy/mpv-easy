import { command } from "@mpv-easy/tool"
import { Box, type MpDom } from "@mpv-easy/react"
import React, { useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as ICON from "../icon"
import {
  buttonStyleSelector,
  type Dispatch,
  playlistStyleSelector,
  playlistSelector,
  playlistHideSelector,
  pathSelector,
} from "../store"
import { getRootNode } from "@mpv-easy/react"
import { ScrollList } from "./components/scroll-list"
import { getVideoName, textEllipsis } from "../common"

export type PlaylistProps = {
  list: string[]
  current: number
}

export const Playlist = () => {
  const playlistStyle = useSelector(playlistStyleSelector)
  const dispatch = useDispatch<Dispatch>()
  const playlist = useSelector(playlistSelector)
  const playlistRef = useRef<MpDom>(null)
  const playlistHide = useSelector(playlistHideSelector)
  const button = useSelector(buttonStyleSelector)
  let x = 0
  let y = 0
  if (playlistRef.current) {
    const rootW = getRootNode().layoutNode.width
    const rootH = getRootNode().layoutNode.height
    const w = playlistRef.current.layoutNode.width
    const h = playlistRef.current.layoutNode.height
    x = (rootW - w) / 2
    y = (rootH - h) / 2
  }

  const path = useSelector(pathSelector)

  return (
    <Box
      id={"playlist"}
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
      {!!playlist.length && (
        <ScrollList
          id="playlist-scroll-list"
          zIndex={playlistStyle.zIndex}
          items={playlist.map((i) => {
            const prefix =
              i === path ? ICON.Ok : ICON.CheckboxBlankCircleOutline
            const name = textEllipsis(
              getVideoName(i) || "",
              playlistStyle.maxTitleLength,
            )
            const label = `${prefix} ${name}`
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
      )}
    </Box>
  )
}
