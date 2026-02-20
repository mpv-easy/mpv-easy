import { Box, type MpDom } from "@mpv-easy/react"
import React, { useRef } from "react"
import * as ICON from "../icon"
import {
  playlistStyleSelector,
  playlistSelector,
  playlistHideSelector,
  pathSelector,
  osdDimensionsSelector,
} from "../store"
import { ScrollList } from "./components/scroll-list"
import { getVideoName } from "../common"
import { dispatch, useSelector } from "../models"
import { isRemote, textEllipsis } from "@mpv-easy/tool"

export type PlaylistProps = {
  list: string[]
  current: number
}

export const Playlist = () => {
  const playlistStyle = useSelector(playlistStyleSelector)
  const playlist = useSelector(playlistSelector)
  const playlistRef = useRef<MpDom>(null)
  const playlistHide = useSelector(playlistHideSelector)
  let pos: undefined | { x: number; y: number }
  const osd = useSelector(osdDimensionsSelector)
  if (playlistRef.current) {
    const w = playlistRef.current.layoutNode.width
    const h = playlistRef.current.layoutNode.height
    pos = { x: (osd.w - w) / 2, y: (osd.h - h) / 2 }
  }

  const path = useSelector(pathSelector)

  return (
    <Box
      id={"playlist"}
      ref={playlistRef}
      x={pos?.x || 0}
      y={pos?.y || 0}
      hide={playlistHide || !pos}
      display="flex"
      position="relative"
      flexDirection="column"
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
            let title = getVideoName(i) || ""
            if (isRemote(i)) {
              try {
                title = decodeURIComponent(title)
              } catch {}
            }
            const s = `${prefix} ${title}`
            const label = textEllipsis(s, playlistStyle.maxTitleLength)
            const showTitle = s !== label
            return {
              id: i,
              key: i,
              label,
              showTitle,
              title,
              onClick: (e) => {
                const index = playlist.indexOf(i)
                if (index >= 0) {
                  // dispatch.setPath(playlist[index])
                  dispatch.setPlaylist(playlist, index)
                }
                dispatch.setPlaylistHide(true)
                e.stopPropagation()
              },
            }
          })}
        />
      )}
    </Box>
  )
}
