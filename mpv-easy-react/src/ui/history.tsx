import { Box, type MpDom } from "@mpv-easy/react"
import React, { useRef } from "react"
import * as ICON from "../icon"
import {
  pathSelector,
  historyHideSelector,
  historySelector,
  historyStyleSelector,
  osdDimensionsSelector,
} from "../store"
import { ScrollList } from "./components/scroll-list"
import { textEllipsis } from "../common"
import { dispatch, useSelector } from "../models"
import { isRemote } from "@mpv-easy/tool"

export type PlaylistProps = {
  list: string[]
  current: number
}

export const History = () => {
  const historyStyle = useSelector(historyStyleSelector)
  const history = useSelector(historySelector)
  const historyRef = useRef<MpDom>(null)
  const historyHide = useSelector(historyHideSelector)
  let pos: undefined | { x: number; y: number } = undefined
  const osd = useSelector(osdDimensionsSelector)
  if (historyRef.current) {
    const w = historyRef.current.layoutNode.width
    const h = historyRef.current.layoutNode.height
    pos = { x: (osd.w - w) / 2, y: (osd.h - h) / 2 }
  }

  const path = useSelector(pathSelector)

  return (
    <Box
      id={"history"}
      ref={historyRef}
      x={pos?.x || 0}
      y={pos?.y || 0}
      hide={historyHide || !pos}
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
            let name = i.name
            if (isRemote(i.path)) {
              try {
                name = decodeURIComponent(name)
              } catch {}
            }
            const s = `${prefix} ${i.name}`
            const label = textEllipsis(s, historyStyle.maxTitleLength)
            const showTitle = s !== label
            return {
              id: i.path,
              key: i.path,
              label,
              title: i.name,
              showTitle,
              onClick: (e) => {
                const index = history.indexOf(i)
                if (index >= 0) {
                  dispatch.setPath(history[index].path)
                }
                dispatch.setHistoryHide(true)
                e.stopPropagation()
              },
            }
          })}
        />
      )}
    </Box>
  )
}
