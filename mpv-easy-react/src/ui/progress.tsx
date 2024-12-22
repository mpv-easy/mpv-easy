import {
  PropertyNative,
  type VideoParams,
  cutVideo,
  detectFfmpeg,
  formatTime,
  getPropertyBool,
  getTimeFormat,
  showNotification,
  registerScriptMessage,
  setPropertyNumber,
  isRemote,
  cropImage,
  cropVideo,
  randomId,
} from "@mpv-easy/tool"
import { Box, type MpDom } from "@mpv-easy/react"
import React, { useRef, useState, useEffect } from "react"
import type { MouseEvent, MpDomProps } from "@mpv-easy/react"
import {
  progressStyleSelector,
  durationSelector,
  timePosSelector,
  smallFontSizeSelector,
  buttonStyleSelector,
  pathSelector,
  thumbfastSelector,
  cutSelector,
  playerStateSelector,
  cropSelector,
  fontSelector,
  seekableSelector,
  videoParamsSelector,
} from "../store"
import { ThumbFast } from "@mpv-easy/thumbfast"
import { getCutVideoPath, getVideoSegment } from "@mpv-easy/cut"
import { dispatch, useSelector } from "../models"
import { getCropImagePath, getCropRect } from "@mpv-easy/crop"

export const Progress = ({ width, height, ...props }: MpDomProps) => {
  const [leftPreview, setLeftPreview] = useState(0)
  const [mouseOut, setMouseOut] = useState(true)
  const progress = useSelector(progressStyleSelector)
  const timePos = useSelector(timePosSelector)
  const duration = useSelector(durationSelector)
  const format = getTimeFormat(duration)
  const thumbRef = useRef<ThumbFast | null>(null)
  const cursorTextStartRef = useRef<MpDom>(null)
  const previewTextRef = useRef<MpDom>(null)
  const progressRef = useRef<MpDom>(null)
  const progressW = progressRef.current?.layoutNode.width
  const cursorLeftOffset = progressW ? progress.cursorSize / 2 / progressW : 0
  const cursorLeft = timePos / duration - cursorLeftOffset
  const path = useSelector(pathSelector)
  const isSeekable = useSelector(seekableSelector)
  const thumbfast = useSelector(thumbfastSelector)
  const { cutPoints, cropPoints, showCrop } = useSelector(playerStateSelector)
  const cutConfig = useSelector(cutSelector)
  const cropConfig = useSelector(cropSelector)
  const [thumbfastUpdateId, setThumbfastUpdateId] = useState(randomId())
  const videoParams = useSelector(videoParamsSelector)
  // TODO: support yt-dlp thumbfast
  // const supportThumbfast = !isYtdlp(path) && isSeekable
  const supportThumbfast = isSeekable && (!isRemote(path) || thumbfast.network)

  const curCutPoint = mouseOut ? timePos : duration * leftPreview

  const cutRef = useRef<(() => void) | null>(null)
  cutRef.current = () => {
    const newPoints = [...cutPoints, curCutPoint]
    while (newPoints.length > 2) {
      newPoints.shift()
    }
    dispatch.setCutPoints(newPoints)
  }

  const cutCancelRef = useRef<(() => void) | null>(null)
  cutCancelRef.current = () => {
    dispatch.setCutPoints([])
  }
  const cancelRef = useRef<() => void>(null)
  const hasSegment = cutPoints.length === 2
  const segment = getVideoSegment(cutPoints)
  const cutCursorLeft =
    cutPoints.length > 0 ? cutPoints[0] / duration : undefined
  const cutCursorRight =
    cutPoints.length > 1 ? cutPoints[1] / duration : undefined
  const areaWidth = hasSegment
    ? (cutPoints[1] - cutPoints[0]) / duration
    : undefined

  cancelRef.current = () => {
    if (showCrop) {
      dispatch.setCropPoints([])
      dispatch.setShowCrop(false)
    } else {
      dispatch.setCutPoints([])
    }
  }

  const outputRef = useRef<() => Promise<void>>(null)
  outputRef.current = async () => {
    if (!path.length) {
      showNotification("video not found")
      return
    }
    const ffmpeg = detectFfmpeg()
    if (!ffmpeg) {
      showNotification("ffmpeg not found")
      return
    }
    if (cropPoints.length === 2) {
      const rect = getCropRect(cropPoints)
      if (!rect) {
        showNotification("invalid video cropping region")
        return
      }
      const segment = getVideoSegment(cutPoints)
      if (segment) {
        if (isRemote(path)) {
          showNotification("cut not support remote video")
          return
        }
        // cut crop video
        const outputPath = getCutVideoPath(
          path,
          segment,
          rect,
          cropConfig.outputDirectory,
        )
        showNotification("crop starting")
        const ok = await cropVideo(path, segment, rect, outputPath, ffmpeg)
        // TODO: To reuse fragments, don't remove cutPoints, should use esc to remove
        // dispatch.setCutPoints([])
        if (!ok) {
          showNotification("failed to crop video")
        } else {
          showNotification("crop video finish")
        }
      } else {
        // crop image
        const outputPath = getCropImagePath(
          path,
          timePos,
          cropConfig.cropImageFormat,
          rect,
          cropConfig.outputDirectory,
        )
        showNotification("crop starting")
        const ok = await cropImage(rect, outputPath, ffmpeg)
        if (!ok) {
          showNotification("failed to crop image")
        } else {
          showNotification("crop image finish")
        }
      }
      dispatch.setShowCrop(false)
      dispatch.setCropPoints([])
      return
    }

    if (!segment) {
      showNotification("cut segment not found")
      return
    }

    if (isRemote(path)) {
      showNotification("cut not support remote video")
      return
    }

    showNotification("cut starting")

    const ok = await cutVideo(
      segment,
      path,
      getCutVideoPath(path, segment, undefined, cutConfig.outputDirectory),
      ffmpeg,
    )
    dispatch.setCutPoints([])
    if (!ok) {
      showNotification("failed to cut")
      return
    }
    showNotification("cut finish")
  }

  useEffect(() => {
    if (!supportThumbfast) {
      return
    }
    if (!videoParams || !videoParams.w || !videoParams.h) {
      return
    }
    if (thumbRef.current) {
      thumbRef.current.exit()
    }
    thumbRef.current = new ThumbFast({
      ...thumbfast,
      videoWidth: videoParams.w,
      videoHeight: videoParams.h,
    })
  }, [videoParams?.w, videoParams?.h, supportThumbfast, isSeekable])

  useEffect(() => {
    registerScriptMessage("cut", () => {
      cutRef.current?.()
    })
    registerScriptMessage("cancel", () => {
      cancelRef.current?.()
    })
    registerScriptMessage("output", () => {
      outputRef.current?.()
    })
  }, [])

  const updatePreviewCursor = (e: MouseEvent) => {
    const w = e.target?.layoutNode.width || 0
    const per = (e.offsetX - progress.cursorSize / 2) / w
    setLeftPreview(per)
    const time = duration * (e.offsetX / w)
    thumbRef.current?.seek(time)
    setThumbfastUpdateId(randomId())
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
  const font = useSelector(fontSelector)
  const showThumbfast =
    thumbRef.current && !mouseOut && !!thumbX && !!thumbY && supportThumbfast

  return (
    <Box
      ref={progressRef}
      display="flex"
      id="progress"
      position="relative"
      width={width}
      height={height}
      color={progress.backgroundColor}
      fontSize={fontSize.fontSize}
      font={font}
      backgroundColor={progress.backgroundColor}
      onMouseDown={(e) => {
        const w = e.target?.layoutNode.width || 0
        const per = e.offsetX / w
        const timePos = per * duration
        dispatch.setTimePos(timePos)
        updatePreviewCursor(e)

        // TODO: same seek function as thumbfast
        // setPropertyNumber("time-pos", timePos)
        // command(`no-osd seek ${timePos} absolute+keyframes`)
        // command(`no-osd async seek ${timePos} absolute+keyframes`)
        e.preventDefault()
      }}
      onMouseMove={(e) => {
        if (!e.target?.attributes.id?.toString().endsWith("progress")) {
          return
        }
        setMouseOut(false)
        updatePreviewCursor(e)
        // e.stopPropagation()
      }}
      onMouseEnter={(e) => {
        // console.log(
        //   "onMouseEnter",
        //   e.target?.attributes.id?.toString(),
        //   !e.target?.attributes.id?.toString().endsWith("progress"),
        // )
        if (!e.target?.attributes.id?.toString().endsWith("progress")) {
          return
        }
        updatePreviewCursor(e)
        setMouseOut(false)
        // e.stopPropagation()
      }}
      onMouseLeave={(e) => {
        // console.log(
        //   "onMouseLeave",
        //   e.target?.attributes.id?.toString(),
        //   !e.target?.attributes.id?.toString().endsWith("progress"),
        // )
        if (!e.target?.attributes.id?.toString().endsWith("progress")) {
          return
        }
        updatePreviewCursor(e)
        setMouseOut(true)
        // e.stopPropagation()
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
        padding={fontSize.padding}
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
        padding={fontSize.padding}
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

      {cutCursorLeft !== undefined && (
        <Box
          id="cut-cursor-left"
          position="relative"
          width={progress.cursorSize}
          left={`${cutCursorLeft * 100}%`}
          height={"100%"}
          backgroundColor={progress.cutCursorColor}
          pointerEvents="none"
        />
      )}
      {cutCursorRight !== undefined && (
        <Box
          id="cut-cursor-right"
          position="relative"
          width={progress.cursorSize}
          left={`${cutCursorRight * 100}%`}
          height={"100%"}
          backgroundColor={progress.cutCursorColor}
          pointerEvents="none"
        />
      )}
      {hasSegment && (
        <Box
          id="cut-cursor-segment"
          position="relative"
          width={`${areaWidth! * 100}%`}
          left={`${cutCursorLeft! * 100}%`}
          height={"100%"}
          backgroundColor={progress.cutSegmentColor}
          pointerEvents="none"
        />
      )}
      <Box
        hide={mouseOut}
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
      >
        <Box
          id="preview-cursor-time"
          position="absolute"
          height={"100%"}
          hide={mouseOut}
          top={"-100%"}
          left={previewTimeTextOffsetX}
          backgroundColor={progress.backgroundColor}
          color={progress.color}
          text={formatTime(leftPreview * duration, format)}
          pointerEvents="none"
          display="flex"
          ref={previewTextRef}
          justifyContent="center"
          alignItems="center"
          zIndex={progress.previewZIndex}
        />
        <Box
          hide={!showThumbfast}
          id={42}
          position="absolute"
          x={thumbX}
          y={thumbY}
          width={thumbRef.current?.thumbWidth}
          height={thumbRef.current?.thumbHeight}
          backgroundImage={`${thumbRef.current?.path}?id=${thumbfastUpdateId}`}
          backgroundImageFormat={thumbRef.current?.format}
          pointerEvents="none"
        />
      </Box>
    </Box>
  )
}
