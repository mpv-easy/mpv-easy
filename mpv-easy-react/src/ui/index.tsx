import React, { useEffect, useRef, useState } from "react"
import { Uosc } from "./uosc"
import { Osc } from "./osc"
import { Oscx } from "./oscx"
import { Toolbar } from "./toolbar"
import { Box, type MpDom, Tooltip } from "@mpv-easy/react"
import {
  modeSelector,
  mousePosSelector,
  pathSelector,
  smallFontSizeSelector,
  styleSelector,
  toolbarStyleSelector,
  uiNameSelector,
  clickMenuStyleSelector,
  protocolHookSelector,
  volumeSelector,
  volumeMaxSelector,
  speedListSelector,
  speedSelector,
  frameTimeSelector,
  translateSelector,
  cellSizeSelector,
  playerStateSelector,
  cropSelector,
  fontSelector,
  normalFontSizeSelector,
  osdDimensionsSelector,
  subScaleSelector,
} from "../store"
import {
  loadRemoteSubtitleAsync,
  getMpvExePath,
  setProtocolHook,
  getPlayWithExePath,
  openDialog,
  registerScriptMessage,
  setPropertyNumber,
  getPropertyNumber,
  getPropertyBool,
  getColor,
  showNotification,
} from "@mpv-easy/tool"
import clamp from "lodash-es/clamp"
import { Playlist } from "./playlist"
import { VoiceControl } from "./voice-control"
import { History } from "./history"
import { Speed } from "./speed"
import { Translation } from "@mpv-easy/translate"
import { Crop } from "@mpv-easy/crop"
import { dispatch, useSelector } from "../models"
export * from "./progress"
export * from "./toolbar"
export * from "./voice-control"
export * from "./playlist"
export * from "./click-menu"
export * from "./osc"
export * from "./uosc"
export function hasPoint(node: MpDom | null, x: number, y: number): boolean {
  if (!node) {
    return false
  }

  if (node.layoutNode.hasPoint(x, y)) {
    return true
  }
  for (const c of node.childNodes) {
    if (hasPoint(c, x, y)) {
      return true
    }
  }
  return false
}

export type EasyProps = {
  initHide: boolean
  fontSize: number
}

export const Easy = (props: Partial<EasyProps>) => {
  const frameTime = useSelector(frameTimeSelector)
  const path = useSelector(pathSelector)
  const protocolHook = useSelector(protocolHookSelector)
  const fontSize = useSelector(normalFontSizeSelector)
  const fontSizeRef = useRef(fontSize.fontSize)
  fontSizeRef.current = fontSize.fontSize

  const volume = useSelector(volumeSelector)
  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const volumeMax = useSelector(volumeMaxSelector)

  const speed = useSelector(speedSelector)
  const speedRef = useRef(speed)
  speedRef.current = speed
  const speedList = useSelector(speedListSelector)
  const speedMax = Math.max(...speedList)
  const speedMin = Math.min(...speedList)
  const osdDimensions = useSelector(osdDimensionsSelector)

  useEffect(() => {
    const mpvExe = getMpvExePath()
    if (protocolHook !== mpvExe) {
      const playPath = getPlayWithExePath()
      if (setProtocolHook(mpvExe, playPath)) {
        dispatch.setProtocolHook(mpvExe)
      }
    }

    dispatch.addHistory(path)
    loadRemoteSubtitleAsync(path)

    registerScriptMessage("open-dialog", () => {
      const v = openDialog()[0]
      if (v) {
        dispatch.playVideo(v)
      }
    })

    registerScriptMessage("volume-change", (e) => {
      const v = Number.parseFloat(`${e}`)
      const s = clamp(volumeRef.current + v, 0, volumeMax)
      dispatch.setVolume(s)
      // setPropertyNumber("volume", s)
      showNotification(`volume: ${s}`, 2)
    })

    registerScriptMessage("increase-fontSize", () => {
      dispatch.increaseFontSize()
    })
    registerScriptMessage("decrease-fontSize", () => {
      dispatch.decreaseFontSize()
    })

    registerScriptMessage("speed-change", (e) => {
      const v = Number.parseFloat(`${e}`)
      const s = clamp(speedRef.current + v, speedMin, speedMax)
      dispatch.setSpeed(s)
      setPropertyNumber("speed", s)
    })
    registerScriptMessage("crop", () => {
      dispatch.setShowCrop(true)
    })
    registerScriptMessage("cancel", () => {
      dispatch.setShowCrop(false)
      dispatch.setCropPoints([])
    })
  }, [])

  const smallFontSize = useSelector(smallFontSizeSelector)
  const style = useSelector(styleSelector)
  const mode = useSelector(modeSelector)
  const toolbar = useSelector(toolbarStyleSelector)

  const uiName = useSelector(uiNameSelector)

  const mousePos = useSelector(mousePosSelector)
  const Element = {
    osc: Osc,
    uosc: Uosc,
    oscx: Oscx,
  }[uiName]

  const tooltip = style[mode].tooltip

  const toolbarRef = useRef<MpDom>(null)
  const elementRef = useRef<MpDom>(null)
  const menuRef = useRef<{ setHide: (v: boolean) => void }>(null)
  const volumeDomRef = useRef<MpDom>(null)
  const [menuHide, setMenuHide] = useState(true)
  const playerState = useSelector(playerStateSelector)
  const showCrop = playerState.showCrop
  const cropPoints = playerState.cropPoints
  const cropConfig = useSelector(cropSelector)

  const { x, y, hover } = mousePos
  const [hide, setHide] = useState(!!props.initHide)
  const hideHandle = useRef(-1)
  const mouseInUI =
    [toolbarRef.current, elementRef.current, volumeDomRef.current].some((i) =>
      hasPoint(i, x, y),
    ) && hover

  const hideUI = () => {
    clearTimeout(hideHandle.current)
    hideHandle.current = +setTimeout(() => {
      setHide(true)
    }, toolbar.autoHideDelay ?? 5000)
  }
  const showUI = () => {
    clearTimeout(hideHandle.current)
    if (hide) {
      setHide(false)
    }
  }

  if (mouseInUI) {
    showUI()
  } else {
    hideUI()
  }
  const translateStyle = useSelector(translateSelector)
  const subScale = useSelector(subScaleSelector)

  const {
    sourceLang,
    targetLang,
    subBackColor,
    subBackColorHover,
    subColorHover,
    firstSubColor,
    secondSubColor,
    firstSubFontface,
    secondSubFontface,
  } = translateStyle

  const clickMenuStyle = useSelector(clickMenuStyleSelector)
  const subFontSize =
    (getPropertyNumber("sub-font-size") ??
      (translateStyle.subFontSize || fontSize.fontSize)) * subScale

  const subColor =
    getColor("sub-color") ?? (translateStyle.subColor || "#FFFFFFFF")
  const subBold =
    getPropertyBool("sub-bold") ?? (translateStyle.subBold || false)
  const subOutlineSize =
    getPropertyNumber("sub-outline-size") ??
    (translateStyle.subOutlineSize || 0)
  const subOutlineColor =
    getColor("sub-outline-color") ?? translateStyle.subOutlineColor
  const h = useSelector(cellSizeSelector)
  const font = useSelector(fontSelector)

  return (
    <>
      <Tooltip
        id="tooltip"
        backgroundColor={tooltip.backgroundColor}
        font={font}
        fontSize={smallFontSize.fontSize}
        color={tooltip.color}
        padding={smallFontSize.padding}
        display="flex"
        justifyContent="center"
        alignItems="center"
        zIndex={style[mode].tooltip.zIndex}
        maxWidth={style[mode].tooltip.maxWidth}
      />

      <Box
        id="mpv-easy-main"
        display="flex"
        width={osdDimensions.w}
        height={osdDimensions.h}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="start"
        position="relative"
        // position="absolute"
        onMouseDown={(e) => {
          if (showCrop) {
            if (cropPoints.length < 2) {
              dispatch.setCropPoints([...cropPoints, [mousePos.x, mousePos.y]])
            } else {
              showNotification("crop points must be 2")
            }
          }

          const isEmptyClick =
            e.target?.attributes.id === "mpv-easy-main" ||
            e.target?.attributes.id === "mpv-easy-speed" ||
            e.target?.attributes.id === undefined

          setTimeout(() => {
            menuRef.current?.setHide(true)
          }, frameTime)

          if (isEmptyClick) {
            // console.log("click empty")
            dispatch.setPlaylistHide(true)
            dispatch.setHistoryHide(true)
          }
        }}
      >
        <Toolbar ref={toolbarRef} hide={hide || showCrop} />
        <Element
          ref={elementRef}
          hide={hide || showCrop}
          width={osdDimensions.w}
        />
        <VoiceControl ref={volumeDomRef} hide={hide || showCrop} />
        {/* {!clickMenuStyle.disable && <ClickMenu ref={menuRef} hide={menuHide} />} */}
        <Playlist />
        <History />
        <Speed />
        {showCrop && (
          <Crop
            mouseX={mousePos.x}
            mouseY={mousePos.y}
            lineColor={cropConfig.lineColor}
            lineWidth={cropConfig.lineWidth}
            osdHeight={osdDimensions.h}
            osdWidth={osdDimensions.w}
            points={cropPoints}
            maskColor={cropConfig.maskColor}
            zIndex={1024}
          />
        )}
        <Translation
          subFontSize={subFontSize}
          subScale={subScale}
          subColor={subColor}
          subBold={subBold}
          subOutlineSize={subOutlineSize}
          subOutlineColor={subOutlineColor}
          sourceLang={sourceLang}
          targetLang={targetLang}
          subBackColor={subBackColor}
          subBackColorHover={subBackColorHover}
          subColorHover={subColorHover}
          bottom={2 * h}
          firstSubColor={firstSubColor}
          firstSubFontface={firstSubFontface}
          secondSubFontface={secondSubFontface}
          secondSubColor={secondSubColor}
        />
      </Box>
    </>
  )
}
