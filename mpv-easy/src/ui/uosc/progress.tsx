import {
  PropertyBool,
  PropertyNumber,
  command,
  getPropertyNumber,
  observeProperty,
  setPropertyNumber,
  formatTime,
  getTimeFormat,
} from "@mpv-easy/tool"
import { Box, Button, DOMElement } from "@mpv-easy/ui"
import React, { useRef, useState } from "react"
import { MouseEvent } from "@mpv-easy/ui"
import { StoreProps } from "../../state-store"
import { pluginName } from "../../main"
import { Len } from "@mpv-easy/ui"

export type ProgressProps = {
  width: Len
  height: Len
  // bottom: Len
  // left: Len
}

export function Progress({
  store,
  dispatch,
  width,
  height,
}: StoreProps & ProgressProps) {
  const [leftPreview, setLeftPreview] = useState(0)
  const [previewCursorHide, setPreviewCursorHide] = useState(true)
  const { style, mode } = store[pluginName]
  const player = store[pluginName].player
  const cursorLeft = player.timePos / player.duration

  const format = getTimeFormat(player.duration)

  const button = style[mode].button.default
  const control = style[mode].control
  const { progress } = style[mode]
  const updatePreviewCursor = (e: MouseEvent) => {
    const w = e.target.layoutNode.width
    const per = (e.offsetX - progress.cursorWidth / 2) / w
    setLeftPreview(per)
    return per
  }

  const cursorTextStartRef = useRef<DOMElement>(null)

  const previewTimeTextOffsetX = (cursorTextStartRef.current?.layoutNode?.width ?? 0) / 2
  return (
    <Box
      display="flex"
      id="uosc-progress"
      position="relative"
      width={width}
      height={height}
      color={progress.backgroundColor}
      fontSize={progress.fontSize}
      font={progress.font}
      backgroundColor={progress.backgroundColor}
      onMouseDown={(e) => {
        const w = e.target.layoutNode.width
        const per = (e.offsetX - progress.cursorWidth / 2) / w
        const timePos = per * player.duration
        dispatch.setTimePos(timePos)
      }}
      onMouseMove={updatePreviewCursor}
      onMouseEnter={(e) => {
        updatePreviewCursor(e)
        setPreviewCursorHide(false)
      }}
      onMouseLeave={(e) => {
        updatePreviewCursor(e)
        setPreviewCursorHide(true)
      }}
    >
      <Box
        ref={cursorTextStartRef}
        id="progress-text-start"
        position="relative"
        left={0}
        height={"100%"}
        justifyContent="center"
        alignItems="center"
        backgroundColor={progress.timeTextBackgroundColor}
        color={progress.timeTextColor}
        text={formatTime(player.timePos, format)}
      />
      <Box
        id="progress-text-end"
        position="relative"
        right={0}
        height={"100%"}
        justifyContent="center"
        alignItems="center"
        backgroundColor={progress.timeTextBackgroundColor}
        color={progress.timeTextColor}
        text={formatTime(player.duration, format)}
      />
      <Box
        id="cursor"
        position="relative"
        width={progress.cursorWidth}
        left={`${cursorLeft * 100}%`}
        height={"100%"}
        backgroundColor={progress.cursorColor}
        color={progress.cursorColor}
      />
      <Box
        id="preview-cursor"
        position="relative"
        width={progress.previewCursorWidth}
        hide={previewCursorHide}
        left={`${leftPreview * 100}%`}
        height={"100%"}
        backgroundColor={progress.previewCursorColor}
        color={progress.previewCursorColor}
      >

        <Box
          id="preview-cursor-time"
          position="absolute"
          hide={previewCursorHide}
          height={"100%"}
          top={"-100%"}
          left={-previewTimeTextOffsetX}
          backgroundColor={button.backgroundColor}
          color={button.color}
          justifyContent="center"
          alignItems="center"
          text={formatTime(leftPreview * player.duration, format)}
        >
        </Box>
      </Box>
    </Box>
  )
}
