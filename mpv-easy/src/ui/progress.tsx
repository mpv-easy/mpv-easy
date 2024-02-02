import { formatTime, getTimeFormat } from "@mpv-easy/tool"
import { Box, DOMElement } from "@mpv-easy/ui"
import React, { useRef, useState } from "react"
import { MouseEvent } from "@mpv-easy/ui"
import { Len } from "@mpv-easy/ui"
import { useSelector, useDispatch } from "react-redux"
import {
  RootState,
  Dispatch,
  progressStyleSelector,
  durationSelector,
  timePosSelector,
} from "../store"

export type ProgressProps = {
  width: Len
  height: Len
}

export const Progress = React.memo(({ width, height }: ProgressProps) => {
  const [leftPreview, setLeftPreview] = useState(0)
  const [previewCursorHide, setPreviewCursorHide] = useState(true)
  const progress = useSelector(progressStyleSelector)
  const timePos = useSelector(timePosSelector)
  const duration = useSelector(durationSelector)
  const dispatch = useDispatch<Dispatch>()
  const cursorLeft = timePos / duration
  const format = getTimeFormat(duration)
  const updatePreviewCursor = (e: MouseEvent) => {
    const w = e.target.layoutNode.width
    const per = (e.offsetX - progress.cursorWidth / 2) / w
    setLeftPreview(per)
    return per
  }
  const cursorTextStartRef = useRef<DOMElement>(null)

  const previewTimeTextOffsetX =
    (cursorTextStartRef.current?.layoutNode?.width ?? 0) / 2

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
        const timePos = per * duration
        dispatch.context.setTimePos(timePos)
        e.preventDefault()
        // console.log(
        //   "----mousedown: ",
        //   w,
        //   per,
        //   timePos,
        //   e.target.layoutNode.width,
        // )
      }}
      onMouseMove={(e) => {
        // console.log("move: ", e.target.attributes.id)
        updatePreviewCursor(e)
        e.stopPropagation()
      }}
      onMouseEnter={(e) => {
        updatePreviewCursor(e)
        setPreviewCursorHide(false)
        e.stopPropagation()
      }}
      onMouseLeave={(e) => {
        updatePreviewCursor(e)
        setPreviewCursorHide(true)
        e.stopPropagation()
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
        text={formatTime(timePos, format)}
        pointerEvents="none"
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
        text={formatTime(duration, format)}
        pointerEvents="none"
      />
      <Box
        id="cursor"
        position="relative"
        width={progress.cursorWidth}
        left={`${cursorLeft * 100}%`}
        height={"100%"}
        backgroundColor={progress.cursorColor}
        color={progress.cursorColor}
        pointerEvents="none"
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
        pointerEvents="none"
      >
        <Box
          id="preview-cursor-time"
          position="absolute"
          hide={previewCursorHide}
          height={"100%"}
          top={"-100%"}
          left={-previewTimeTextOffsetX}
          backgroundColor={progress.backgroundColor}
          color={progress.color}
          justifyContent="center"
          alignItems="center"
          text={formatTime(leftPreview * duration, format)}
          zIndex={progress.previewZIndex}
          pointerEvents="none"
        ></Box>
      </Box>
    </Box>
  )
})
