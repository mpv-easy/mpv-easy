import React, { useEffect, useReducer, useRef, useState } from "react"
import { Uosc } from "./uosc"
import { Osc } from "./osc"
import { Oscx } from "./oscx"
import { Toolbar } from "./toolbar"
import { Box, DefaultFps, type MpDom, Tooltip } from "@mpv-easy/react"
import {
  modeSelector,
  mousePosSelector,
  smallFontSizeSelector,
  styleSelector,
  toolbarStyleSelector,
  uiNameSelector,
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
  pathSelector,
  tooltipSelector,
} from "../store"
import {
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
  getOptions,
  setPropertyBool,
  VideoTypes,
  getProperty,
  whisper,
  detectFfmpeg,
  whisperConfig,
  detectWhisperModel,
  normalize,
  subAdd,
} from "@mpv-easy/tool"
import clamp from "lodash-es/clamp"
import { Playlist } from "./playlist"
import { VoiceControl } from "./voice-control"
import { History } from "./history"
import { Speed } from "./speed"
import { Translation } from "@mpv-easy/translate"
import { Crop } from "@mpv-easy/crop"
import { dispatch, useSelector } from "../models"
import { Logo } from "./components/logo"
export * from "./progress"
export * from "./toolbar"
export * from "./voice-control"
export * from "./playlist"
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
  fps: number
}

export const Easy = (props: Partial<EasyProps>) => {
  const frameTime = useSelector(frameTimeSelector)
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
  const tooltip = useSelector(tooltipSelector)

  useEffect(() => {
    const mpvExe = getMpvExePath()
    if (protocolHook !== mpvExe) {
      const playPath = getPlayWithExePath()
      if (setProtocolHook(mpvExe, playPath)) {
        dispatch.setProtocolHook(mpvExe)
        showNotification("protocol install successfully")
      }
    }

    registerScriptMessage("open-dialog", () => {
      const v = openDialog()[0]
      if (v) {
        dispatch.playVideo(v)
      }
    })

    registerScriptMessage("change-volume", (e) => {
      const v = Number.parseFloat(`${e}`)
      const s = clamp(volumeRef.current + v, 0, volumeMax)
      dispatch.setVolume(s)
      // setPropertyNumber("volume", s)
      showNotification(`volume: ${s}`, 2)
    })

    registerScriptMessage("change-fontSize", (n) => {
      dispatch.changeFontSize(Number.parseFloat(n))
    })

    registerScriptMessage("change-speed", (e) => {
      const v = Number.parseFloat(e)
      const s = clamp(speedRef.current + v, speedMin, speedMax)
      dispatch.setSpeed(s)
      setPropertyNumber("speed", s)
    })
    registerScriptMessage("crop", () => {
      dispatch.setShowCrop(true)
    })
    registerScriptMessage("cancel", () => {
      dispatch.cancel()
    })
    registerScriptMessage("preview", () => {
      dispatch.preview()
    })

    registerScriptMessage("mouse-right-click", () => {
      dispatch.setPause(!getPropertyBool("pause"))
    })
    registerScriptMessage("toggle-tooltip", () => {
      dispatch.toggleTooltip()
    })

    registerScriptMessage("whisper", async () => {
      const p = normalize(getProperty("path") || "")
      if (!p) {
        return
      }
      const videoType = VideoTypes.find((i) => p?.endsWith(`.${i}`))
      if (!videoType) {
        return
      }

      const ffmpeg = detectFfmpeg()
      if (!ffmpeg) {
        return
      }

      const destination = p.replace(`.${videoType}`, ".srt")
      const model = detectWhisperModel()
      if (!model) {
        return
      }
      const config: whisperConfig = {
        model,
        destination,
        format: "srt",
      }
      const r = await whisper(p, config, ffmpeg)
      if (r) {
        showNotification("Whisper success", 5)
        subAdd(destination)
      } else {
        showNotification("Whisper failed", 5)
      }
    })

    // FIXME: update thumbfast when pause
    const h = setInterval(update, 1000 / (props.fps || DefaultFps))

    const { ontop } = getOptions("mpv-easy", {
      ontop: {
        type: "boolean",
        default: false,
      },
    })
    if (ontop) {
      const oldOntop = getPropertyBool("ontop", false)

      setPropertyBool("ontop", true)
      setPropertyBool("focused", true)

      setTimeout(() => {
        setPropertyBool("ontop", oldOntop)
      })
    }

    return () => clearInterval(h)
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

  const tooltipStyle = style[mode].tooltip

  const toolbarRef = useRef<MpDom>(null)
  const elementRef = useRef<MpDom>(null)
  const menuRef = useRef<{ setHide: (v: boolean) => void }>(null)
  const volumeDomRef = useRef<MpDom>(null)
  const playerState = useSelector(playerStateSelector)
  const { cropPoints, showCrop } = playerState
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

  useEffect(() => {
    if (mouseInUI) {
      showUI()
    } else {
      hideUI()
    }
  }, [mouseInUI])

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

  const subFontSize = getPropertyNumber("sub-font-size")

  const subColor = getColor("sub-color")
  const subBold = getPropertyBool("sub-bold")
  const subOutlineSize = getPropertyNumber("sub-outline-size")
  const subOutlineColor = getColor("sub-outline-color")
  const h = useSelector(cellSizeSelector)
  const font = useSelector(fontSelector)
  const update = useReducer((prev) => (prev + 1) % 1000, 0)[1]
  const path = useSelector(pathSelector)
  const showLogo =
    !path && !showCrop && playerState.historyHide && playerState.playlistHide

  return (
    <Box
      id="mpv-easy-main"
      display="flex"
      width={"100%"}
      height={"100%"}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="start"
      position="relative"
      onMouseDown={(e) => {
        setTimeout(() => {
          // FIXME: update tooltip
          update()
        })

        if (showCrop) {
          if (cropPoints.length < 2) {
            dispatch.setCropPoints([...cropPoints, [mousePos.x, mousePos.y]])
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
      {tooltip && (
        <Tooltip
          id="tooltip"
          backgroundColor={tooltipStyle.backgroundColor}
          font={font}
          fontSize={smallFontSize.fontSize}
          color={tooltipStyle.color}
          padding={smallFontSize.padding}
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex={style[mode].tooltip.zIndex}
          maxWidth={style[mode].tooltip.maxWidth}
          mousePos={mousePos}
          height="auto"
          width="auto"
        />
      )}

      <Toolbar ref={toolbarRef} hide={hide || showCrop} />
      <Element ref={elementRef} hide={hide || showCrop} width={"100%"} />
      <VoiceControl ref={volumeDomRef} hide={hide || showCrop} />
      {/* {!clickMenuStyle.disable && <ClickMenu ref={menuRef} hide={menuHide} />} */}
      <Playlist />
      <History />
      <Speed />
      {showLogo && <Logo />}
      {showCrop && (
        <Crop
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          lineColor={cropConfig.lineColor}
          lineColorHover={cropConfig.lineColorHover}
          lineWidth={cropConfig.lineWidth}
          osdHeight={osdDimensions.h}
          osdWidth={osdDimensions.w}
          points={cropPoints}
          maskColor={cropConfig.maskColor}
          zIndex={cropConfig.cropZIndex}
          onChange={dispatch.setCropPoints}
          labelFontSize={smallFontSize.fontSize}
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
        subSrtScale={translateStyle.subSrtScale}
      />
    </Box>
  )
}
