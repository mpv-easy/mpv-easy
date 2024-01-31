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
import { pluginName } from "../../main"
import { Len } from "@mpv-easy/ui"
import { store } from "../../example/redux-toolkit/store"
import { useSelector, useDispatch } from "react-redux"
import { RootStore, Dispatch } from "../../store"
import { pluginName as i18nName } from "@mpv-easy/i18n"

export type ProgressProps = {
  width: Len
  height: Len
  // bottom: Len
  // left: Len
}

export const Progress = React.memo(({ width, height }: ProgressProps) => {
  const [leftPreview, setLeftPreview] = useState(0)
  const [previewCursorHide, setPreviewCursorHide] = useState(true)

  const mode = useSelector((store: RootStore) => store.context[pluginName].mode)
  const button = useSelector(
    (store: RootStore) => store.context[pluginName].style[mode].button.default,
  )
  const control = useSelector(
    (store: RootStore) => store.context[pluginName].style[mode].control,
  )
  const language = useSelector(
    (store: RootStore) => store.context[i18nName].default,
  )
  const uiName = useSelector(
    (store: RootStore) => store.context[pluginName].name,
  )
  const i18n = useSelector(
    (store: RootStore) => store.context[i18nName].lang[language],
  )
  const progress = useSelector(
    (store: RootStore) => store.context[pluginName].style[mode].progress,
  )
  const player = useSelector(
    (store: RootStore) => store.context[pluginName].player,
  )

  const timePos = useSelector(
    (store: RootStore) => store.context[pluginName].player.timePos,
  )
  const duration = useSelector(
    (store: RootStore) => store.context[pluginName].player.duration,
  )

  const mouseHoverStyle = useSelector(
    (store: RootStore) => store.context.experimental.mouseHoverStyle,
  )

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
        text={formatTime(timePos, format)}
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
          backgroundColor={progress.backgroundColor}
          color={progress.color}
          justifyContent="center"
          alignItems="center"
          text={formatTime(leftPreview * duration, format)}
          zIndex={progress.previewZIndex}
        ></Box>
      </Box>
    </Box>
  )
})
