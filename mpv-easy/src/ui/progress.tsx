import {
  PropertyNative,
  type VideoParams,
  formatTime,
  getTimeFormat,
  randomId,
  setPropertyNumber,
} from "@mpv-easy/tool"
import { Box, type MpDom } from "@mpv-easy/ui"
import React, { useRef, useState, useEffect } from "react"
import type { MouseEvent, MpDomProps } from "@mpv-easy/ui"
import { useSelector, useDispatch } from "react-redux"
import {
  type Dispatch,
  progressStyleSelector,
  durationSelector,
  timePosSelector,
  smallFontSizeSelector,
  buttonStyleSelector,
} from "../store"
import { ThumbFast } from "@mpv-easy/thumbfast"

export const Progress = ({ width, height, ...props }: MpDomProps) => {
  const [leftPreview, setLeftPreview] = useState(0)
  const [previewCursorHide, setPreviewCursorHide] = useState(true)
  const progress = useSelector(progressStyleSelector)
  const button = useSelector(buttonStyleSelector)
  const timePos = useSelector(timePosSelector)
  const duration = useSelector(durationSelector)
  const dispatch = useDispatch<Dispatch>()
  const format = getTimeFormat(duration)
  const thumbRef = useRef<ThumbFast>()
  const cursorTextStartRef = useRef<MpDom>(null)
  const previewTextRef = useRef<MpDom>(null)
  const progressRef = useRef<MpDom>(null)
  const progressW = progressRef.current?.layoutNode.width
  const cursorLeftOffset = progressW ? progress.cursorSize / 2 / progressW : 0
  const cursorLeft = timePos / duration - cursorLeftOffset

  useEffect(() => {
    new PropertyNative<VideoParams>("video-params").observe((v) => {
      if (!v) {
        return
      }
      const { w = 0, h = 0 } = v
      if (!w || !h) {
        return
      }
      if (thumbRef.current) {
        thumbRef.current.exit()
      }
      const ipcId = `ipc_${randomId()}`
      thumbRef.current = new ThumbFast({
        ipcId,
        videoWidth: w,
        videoHeight: h,
      })
    })
  }, [])
  const updatePreviewCursor = (e: MouseEvent) => {
    const w = e.target?.layoutNode.width || 0
    const per = (e.offsetX - progress.cursorSize / 2) / w
    setLeftPreview(per)
    const time = duration * (e.offsetX / w)
    thumbRef.current?.seek(time)
    return per
  }
  const hoverCursorRef = useRef<MpDom>(null)

  const previewTextWidth = previewTextRef.current?.layoutNode.width ?? 0
  const previewTimeTextOffsetX = (progress.cursorSize - previewTextWidth) >> 1
  let thumbX = 0
  let thumbY = 0

  if (hoverCursorRef.current) {
    const { x, y, height, width } = hoverCursorRef.current.layoutNode
    thumbX = x + width / 2 - (thumbRef.current?.thumbWidth ?? 0) / 2
    thumbY = y - (thumbRef.current?.thumbHeight ?? 0) - height
  }

  const fontSize = useSelector(smallFontSizeSelector)

  return (
    <Box
      ref={progressRef}
      display="flex"
      id="uosc-progress"
      position="relative"
      width={width}
      height={height}
      color={progress.backgroundColor}
      fontSize={fontSize}
      font={progress.font}
      backgroundColor={progress.backgroundColor}
      onMouseDown={(e) => {
        const w = e.target?.layoutNode.width || 0
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
      {...props}
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
        padding={button.padding}
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
        padding={button.padding}
        pointerEvents="none"
      />
      <Box
        id="cursor"
        position="relative"
        width={progress.cursorSize}
        left={`${cursorLeft * 100}%`}
        height={"100%"}
        backgroundColor={progress.cursorColor}
        color={progress.cursorColor}
        pointerEvents="none"
      />
      {!previewCursorHide && (
        <Box
          ref={hoverCursorRef}
          id="preview-cursor"
          position="relative"
          width={progress.previewCursorSize}
          left={`${leftPreview * 100}%`}
          height={"100%"}
          backgroundColor={progress.previewCursorColor}
          color={progress.previewCursorColor}
          pointerEvents="none"
          zIndex={progress.previewZIndex}
          display="flex"
          alignContent="stretch"
          // justifyContent="center"
          // alignItems="center"
        >
          {!previewCursorHide && (
            <Box
              id="preview-cursor-time"
              position="absolute"
              height={"100%"}
              top={"-100%"}
              left={previewTimeTextOffsetX}
              backgroundColor={progress.backgroundColor}
              color={progress.color}
              text={formatTime(leftPreview * duration, format)}
              pointerEvents="none"
              display="flex"
              ref={previewTextRef}
              // alignContent='stretch'
              justifyContent="center"
              alignItems="center"
            />
          )}

          {thumbRef.current && !previewCursorHide && !!thumbX && !!thumbY && (
            <Box
              id={42}
              position="absolute"
              x={thumbX}
              y={thumbY}
              width={thumbRef.current?.thumbWidth}
              height={thumbRef.current?.thumbHeight}
              backgroundImage={thumbRef.current?.path}
              backgroundImageFormat={thumbRef.current?.format}
              pointerEvents="none"
              // display="flex"
              // alignContent='stretch'
              // justifyContent="center"
              // alignItems="center"
            />
          )}
        </Box>
      )}
    </Box>
  )
}
