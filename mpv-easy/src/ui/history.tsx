import { command, getFileName } from "@mpv-easy/tool"
import { Box, Button, DOMElement } from "@mpv-easy/ui"
import React, { useEffect, useRef } from "react"
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
  historyHideSelector,
  historySelector,
  historyStyleSelector,
} from "../store"
import { getRootNode } from "@mpv-easy/ui"
import { ScrollList } from "./components/scroll-list"
import { textEllipsis } from "../common"

export type PlaylistProps = {
  list: string[]
  current: number
}

export const History = React.memo(() => {
  const historyStyle = useSelector(historyStyleSelector)
  const dispatch = useDispatch<Dispatch>()
  const history = useSelector(historySelector)
  const historyRef = useRef<DOMElement>(null)
  const historyHide = useSelector(historyHideSelector)
  const button = useSelector(buttonStyleSelector)
  let x = 0
  let y = 0
  if (historyRef.current) {
    const rootW = getRootNode().layoutNode.width
    const rootH = getRootNode().layoutNode.height
    const w = historyRef.current.layoutNode.width
    const h = historyRef.current.layoutNode.height
    x = (rootW - w) / 2
    y = (rootH - h) / 2
  }

  const path = useSelector(pathSelector)

  return (
    <Box
      id={"history-main"}
      ref={historyRef}
      x={x}
      y={y}
      hide={historyHide}
      display="flex"
      position="relative"
      flexDirection="row"
      justifyContent="start"
      alignContent="stretch"
      alignItems="start"
      backgroundColor={historyStyle.backgroundColor}
    >
      {!!history.length && (
        <ScrollList
          zIndex={historyStyle.zIndex}
          items={history.map((i) => {
            const prefix =
              i === path ? ICON.Ok : ICON.CheckboxBlankCircleOutline
            const name = textEllipsis(
              getFileName(i) || "",
              historyStyle.maxTitleLength,
            )
            const label = `${prefix} ${name}`
            return {
              key: i,
              label,
              onClick: (e) => {
                const index = history.indexOf(i)
                if (index >= 0) {
                  dispatch.context.setPath(history[index])
                  command(`loadfile "${history[index]}"`)
                }
                dispatch.context.setHistoryHide(true)
                e.stopPropagation()
              },
            }
          })}
        />
      )}
    </Box>
  )
})
