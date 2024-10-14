import { loadfile } from "@mpv-easy/tool"
import { Box, type MpDom } from "@mpv-easy/react"
import React, { useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as ICON from "../icon"
import {
  type Dispatch,
  pathSelector,
  historyHideSelector,
  historySelector,
  historyStyleSelector,
} from "../store"
import { getRootNode } from "@mpv-easy/react"
import { ScrollList } from "./components/scroll-list"
import { textEllipsis } from "../common"

export type PlaylistProps = {
  list: string[]
  current: number
}

export const History = () => {
  const historyStyle = useSelector(historyStyleSelector)
  const dispatch = useDispatch<Dispatch>()
  const history = useSelector(historySelector)
  const historyRef = useRef<MpDom>(null)
  const historyHide = useSelector(historyHideSelector)
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
      id={"history"}
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
          id={"history-scroll-list"}
          zIndex={historyStyle.zIndex}
          items={history.map((i) => {
            const prefix =
              i.path === path ? ICON.Ok : ICON.CheckboxBlankCircleOutline
            const s = `${prefix} ${i.name}`
            const label = textEllipsis(s, historyStyle.maxTitleLength)
            const showTitle = s !== label
            return {
              key: i.path,
              label,
              showTitle,
              onClick: (e) => {
                const index = history.indexOf(i)
                if (index >= 0) {
                  dispatch.context.setPath(history[index].path)
                  loadfile(history[index].path)
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
}
