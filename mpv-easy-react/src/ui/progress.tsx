import {
  cutVideo,
  detectFfmpeg,
  formatTime,
  getTimeFormat,
  showNotification,
  registerScriptMessage,
  isRemote,
  cropImage,
  cropVideo,
  randomId,
  GifConfig,
  clamp,
  saveSrt,
  Srt,
  writeFile,
  getPropertyNumber,
  setPropertyNative,
  getTmpPath,
  subRemove,
  subAdd,
} from "@mpv-easy/tool"
import { Box, type MpDom } from "@mpv-easy/react"
import React, { useRef, useState, useEffect } from "react"
import type { MouseEvent, MpDomProps } from "@mpv-easy/react"
import {
  progressStyleSelector,
  durationSelector,
  timePosSelector,
  smallFontSizeSelector,
  pathSelector,
  thumbfastSelector,
  cutSelector,
  playerStateSelector,
  cropSelector,
  fontSelector,
  seekableSelector,
  videoParamsSelector,
  cellSizeSelector,
  mousePosSelector,
  osdDimensionsSelector,
} from "../store"
import { ThumbFast } from "@mpv-easy/thumbfast"
import { appendPoint, getCutVideoPath, getVideoSegment } from "@mpv-easy/cut"
import { dispatch, useSelector } from "../models"
import { getCropImagePath, getCropRect } from "@mpv-easy/crop"

export const Progress = ({ width, ...props }: MpDomProps) => {
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
  const { cutPoints, cropPoints, showCrop, preview } =
    useSelector(playerStateSelector)
  const cutConfig = useSelector(cutSelector)
  const cropConfig = useSelector(cropSelector)
  const [thumbfastUpdateId, setThumbfastUpdateId] = useState(randomId())
  const videoParams = useSelector(videoParamsSelector)
  const cellSize = useSelector(cellSizeSelector)
  const mousePos = useSelector(mousePosSelector)
  const osd = useSelector(osdDimensionsSelector)
  // TODO: support yt-dlp thumbfast
  // const supportThumbfast = !isYtdlp(path) && isSeekable
  const supportThumbfast = isSeekable && (!isRemote(path) || thumbfast.network)

  const curCutPoint = mouseOut ? timePos : duration * leftPreview

  const cutRef = useRef<(() => void) | null>(null)
  cutRef.current = () => {
    const newPoints = appendPoint(cutPoints, curCutPoint)
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

    if (originSubRef.current > 0 && mergeSubRef.current > 0) {
      clearMerge()
    }
  }

  const outputRef = useRef<(gifConfig?: GifConfig) => Promise<void>>(null)
  outputRef.current = async (gifConfig?: GifConfig) => {
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
        showNotification("cut and crop starting", -1)
        const ok = await cropVideo(
          path,
          segment,
          rect,
          outputPath,
          gifConfig,
          ffmpeg,
        )
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
        showNotification("crop starting", -1)
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

    // if (isRemote(path)) {
    //   showNotification("cut not support remote video")
    //   return
    // }

    showNotification("output starting", -1)

    const ok = await cutVideo(
      segment,
      path,
      getCutVideoPath(path, segment, undefined, cutConfig.outputDirectory),
      gifConfig,
      ffmpeg,
    )
    dispatch.setCutPoints([])
    if (!ok) {
      showNotification("failed to output")
      return
    }
    showNotification("output finish")
  }

  const clearMerge = () => {
    subRemove(mergeSubRef.current)
    setPropertyNative("sid", originSubRef.current)
    originSubRef.current = -1
    mergeSubRef.current = -1
    return
  }
  const subtitleMergeRef = useRef<() => void>(null)
  const originSubRef = useRef(-1)
  const mergeSubRef = useRef(-1)

  subtitleMergeRef.current = async () => {
    if (originSubRef.current > 0 && mergeSubRef.current > 0) {
      clearMerge()
      return
    }

    const sid = getPropertyNumber("sid", -1)
    if (sid < 0) {
      return
    }
    if (originSubRef.current < 0) {
      originSubRef.current = sid
    }
    const outputPath = getTmpPath("srt")
    const text = await saveSrt(path, sid, outputPath, cutPoints)
    if (!text) {
      return
    }
    const subText = new Srt(text).toText()
    const mergePath = getTmpPath("srt")
    writeFile(mergePath, ["1", "00:0:0,0 --> 99:00:00,00", subText].join("\n"))
    subAdd(mergePath, "select", "merge")
    mergeSubRef.current = getPropertyNumber("sid", -1)
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
    registerScriptMessage(cutConfig.cutEventName, () => {
      cutRef.current?.()
    })
    registerScriptMessage(cutConfig.cancelEventName, () => {
      cancelRef.current?.()
    })
    registerScriptMessage(cutConfig.outputEventName, () => {
      outputRef.current?.()
    })

    registerScriptMessage(cutConfig.outputGifEventName, () => {
      outputRef.current?.({
        fps: cutConfig.fps,
        flags: cutConfig.flags,
        maxWidth: cutConfig.maxWidth,
      })
    })

    registerScriptMessage("screenshot", () => {
      dispatch.screenshot()
    })
    registerScriptMessage("subtitle-merge", () => {
      subtitleMergeRef.current?.()
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
  const previewTextWidth = previewTextRef.current?.layoutNode.width ?? 0
  const previewTimeTextOffsetX = (progress.cursorSize - previewTextWidth) >> 1

  let thumbPos: undefined | { x: number; y: number } = undefined

  if (!mouseOut && thumbRef.current) {
    const width = progress.cursorSize
    const x = mousePos.x + width / 2
    const y = osd.h - cellSize
    const thumbX = clamp(
      x + width / 2 - thumbRef.current.thumbWidth / 2,
      0,
      osd.w - thumbRef.current.thumbWidth,
    )
    const thumbY = y - thumbRef.current.thumbHeight - cellSize
    thumbPos = { x: thumbX, y: thumbY }
  }
  const fontSize = useSelector(smallFontSizeSelector)
  const font = useSelector(fontSelector)
  const showThumbfast =
    thumbRef.current && !mouseOut && thumbPos && supportThumbfast

  return (
    <Box
      ref={progressRef}
      display="flex"
      id="progress"
      position="relative"
      width={width}
      height={cellSize}
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
          backgroundColor={
            preview ? progress.previewSegmentColor : progress.cutCursorColor
          }
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
          backgroundColor={
            preview ? progress.previewSegmentColor : progress.cutCursorColor
          }
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
          backgroundColor={
            preview ? progress.previewSegmentColor : progress.cutSegmentColor
          }
          pointerEvents="none"
        />
      )}
      <Box
        hide={mouseOut}
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
          x={thumbPos?.x || 0}
          y={thumbPos?.y || 0}
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
