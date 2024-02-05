import {
  command,
  formatTime,
  getTimeFormat,
  isVideo,
  randomId,
  setPropertyNumber,
} from "@mpv-easy/tool"
import { Box, DOMElement } from "@mpv-easy/ui"
import React, { useRef, useState, useLayoutEffect } from "react"
import { MouseEvent } from "@mpv-easy/ui"
import { Len } from "@mpv-easy/ui"
import { useSelector, useDispatch } from "react-redux"
import {
  Dispatch,
  progressStyleSelector,
  durationSelector,
  timePosSelector,
  pathSelector,
  videoParamsSelector,
} from "../store"
import { ThumbFast } from "@mpv-easy/thumbfast"

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
  const format = getTimeFormat(duration)
  const path = useSelector(pathSelector)
  const thumbRef = useRef<ThumbFast>()
  const cursorTextStartRef = useRef<DOMElement>(null)
  const progressRef = useRef<DOMElement>(null)
  const videoParams = useSelector(videoParamsSelector) ?? {}

  const seekable = isVideo(path)
  if (!thumbRef.current) {
    // const
    const { w, h } = videoParams
    if (w && h) {
      thumbRef.current = new ThumbFast({
        ipcId: randomId(),
        videoWidth: w,
        videoHeight: h,
      })
    }
  }
  // const cursorLeft = timePos / duration
  const progressW = progressRef.current?.layoutNode.width
  const cursorLeftOffset = progressW ? progress.cursorWidth / 2 / progressW : 0
  const cursorLeft = timePos / duration - cursorLeftOffset

  useLayoutEffect(() => {
    if (thumbRef.current) {
      thumbRef.current.exit()
    }
    const { w, h } = videoParams
    if (w && h) {
      thumbRef.current = new ThumbFast({
        ipcId: randomId(),
        videoWidth: w,
        videoHeight: h,
      })
    }
  }, [path])

  const updatePreviewCursor = (e: MouseEvent) => {
    const w = e.target.layoutNode.width
    const per = (e.offsetX - progress.cursorWidth / 2) / w
    setLeftPreview(per)
    const time = duration * (e.offsetX / w)
    thumbRef.current?.seek(time)
    return per
  }
  const hoverCursorRef = useRef<DOMElement>(null)

  // const previewTimeTextOffsetX = (hoverCursorRef.current?.layoutNode.x ?? 0) + (hoverCursorRef.current?.layoutNode.width ?? 0) / 2
  // - (cursorTextStartRef.current?.layoutNode?.width ?? 0) / 2

  const previewTimeTextOffsetX =
    (progress.cursorWidth -
      (cursorTextStartRef.current?.layoutNode?.width ?? 0)) /
    2
  let thumbX = 0
  let thumbY = 0

  if (hoverCursorRef.current) {
    const { x, y, height, width } = hoverCursorRef.current.layoutNode
    thumbX = x + width / 2 - (thumbRef.current?.thumbWidth ?? 0) / 2
    thumbY = y - (thumbRef.current?.thumbHeight ?? 0) - height
  }

  return (
    <Box
      ref={progressRef}
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
        const per = e.offsetX / w
        const timePos = per * duration
        dispatch.context.setTimePos(timePos)
        updatePreviewCursor(e)

        // TODO: same seek function as thumbfast
        setPropertyNumber("time-pos", timePos)
        // command(`no-osd seek ${timePos} absolute+keyframes`)
        // command(`no-osd async seek ${timePos} absolute+keyframes`)
        e.preventDefault()
      }}
      onMouseMove={(e) => {
        setPreviewCursorHide(false)
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
      {seekable && (
        <Box
          ref={hoverCursorRef}
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
            left={previewTimeTextOffsetX}
            backgroundColor={progress.backgroundColor}
            color={progress.color}
            justifyContent="center"
            alignItems="center"
            text={formatTime(leftPreview * duration, format)}
            zIndex={progress.previewZIndex}
            pointerEvents="none"
          ></Box>

          <Box
            id={42}
            position="absolute"
            hide={previewCursorHide}
            x={thumbX}
            y={thumbY}
            width={thumbRef.current?.thumbWidth}
            height={thumbRef.current?.thumbHeight}
            backgroundImage={thumbRef.current?.path}
            backgroundImageFormat={thumbRef.current?.format}
            pointerEvents="none"
          ></Box>
        </Box>
      )}
    </Box>
  )
})
