import React, { useEffect, useRef, useState } from "react"
import { Uosc } from "./uosc"
import { Osc } from "./osc"
import { Oscx } from "./oscx"
import { Toolbar } from "./toolbar"
import { Box, type MpDom, Tooltip } from "@mpv-easy/react"
import { useSelector, useDispatch } from "react-redux"
import {
  type Dispatch,
  audoloadConfigSelector,
  modeSelector,
  mousePosSelector,
  pathSelector,
  smallFontSizeSelector,
  styleSelector,
  toolbarStyleSelector,
  uiNameSelector,
  clickMenuStyleSelector,
  protocolHookSelector,
  fontSizeSelector,
  volumeSelector,
  volumeMaxSelector,
  speedListSelector,
  speedSelector,
  frameTimeSelector,
  translateSelector,
  IconButtonSizeSelector,
  playerStateSelector,
  cropSelector,
} from "../store"
import {
  PropertyBool,
  PropertyNumber,
  PropertyString,
  PropertyNative,
  type MousePos,
  type MpvPropertyTypeMap,
  type VideoParams,
  normalize,
  dirname,
  getMpvPlaylist,
  loadRemoteSubtitle,
  loadRemoteSubtitleAsync,
  getMpvExePath,
  setProtocolHook,
  getPlayWithExePath,
  openDialog,
  getExtName,
  registerScriptMessage,
  setPropertyNumber,
  printAndOsd,
  getPropertyNumber,
  getPropertyBool,
  getColor,
} from "@mpv-easy/tool"
import throttle from "lodash-es/throttle"
import isEqual from "lodash-es/isEqual"
import clamp from "lodash-es/clamp"
import { ClickMenu } from "./click-menu"
import { Playlist } from "./playlist"
import { getPlayableList } from "@mpv-easy/autoload"
import { VoiceControl } from "./voice-control"
import { History } from "./history"
import { Speed } from "./speed"
import { Translation } from "@mpv-easy/translate"
import { Crop } from "@mpv-easy/crop"

export * from "./progress"
export * from "./toolbar"
export * from "./voice-control"
export * from "./playlist"
export * from "./click-menu"
export * from "./osc"
export * from "./uosc"

const windowMaximizedProp = new PropertyBool("window-maximized")
const fullscreenProp = new PropertyBool("fullscreen")
const timePosProp = new PropertyNumber("time-pos")
const durationProp = new PropertyNumber("duration")
const pauseProp = new PropertyBool("pause")
const pathProp = new PropertyString("path")
const mousePosProp = new PropertyNative<MousePos>("mouse-pos")
const videoParamsProp = new PropertyNative<VideoParams>("video-params")
const muteProp = new PropertyBool("mute")

const aidProp = new PropertyNumber("aid")
const vidProp = new PropertyNumber("vid")
const sidProp = new PropertyNumber("sid")
const volumeProp = new PropertyNumber("volume")
const volumeMaxProp = new PropertyNumber("volume-max")
const speedProp = new PropertyNumber("speed")
const playlistCount = new PropertyNumber("playlist/count")
const osdDimensionsProp = new PropertyNative<
  MpvPropertyTypeMap["osd-dimensions"]
>("osd-dimensions")
const minFontSize = 12
const maxFontSize = 120
const fontStep = 12
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
  const dispatch = useDispatch<Dispatch>()
  const frameTime = useSelector(frameTimeSelector)
  const path = useSelector(pathSelector)
  const autoloadConfig = useSelector(audoloadConfigSelector)
  const protocolHook = useSelector(protocolHookSelector)
  const fontSize = useSelector(fontSizeSelector)
  const fontSizeRef = useRef(fontSize)
  fontSizeRef.current = fontSize

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

  useEffect(() => {
    const mpvExe = getMpvExePath()
    if (protocolHook !== mpvExe) {
      const playPath = getPlayWithExePath()
      if (setProtocolHook(mpvExe, playPath)) {
        dispatch.context.setProtocolHook(mpvExe)
      }
    }

    if (props.fontSize) {
      dispatch.context.setFontSize(props.fontSize)
    }

    dispatch.context.addHistory(path)
    loadRemoteSubtitleAsync(path)

    playlistCount.observe((v) => {
      const p = pathProp.value
      if (path !== p) {
        const list = getMpvPlaylist()
        const i = list.indexOf(p)
        dispatch.context.setPlaylist(list, i === -1 ? 0 : i)
      }
    })

    aidProp.observe((v) => {
      dispatch.context.setAid(v)
    })
    vidProp.observe((v) => {
      dispatch.context.setVid(v)
    })
    sidProp.observe((v) => {
      dispatch.context.setSid(v)
    })
    speedProp.observe((v) => {
      dispatch.context.setSpeed(v)
    })
    volumeProp.observe((v) => {
      dispatch.context.setVolume(v)
    })
    volumeMaxProp.observe((v) => {
      dispatch.context.setVolumeMax(v)
    })
    videoParamsProp.observe((v) => {
      dispatch.context.setVideoParams(v ?? {})
    })
    windowMaximizedProp.observe((v) => {
      dispatch.context.setWindowMaximized(v)
    })

    fullscreenProp.observe((v) => {
      dispatch.context.setFullscreen(v)
    })

    const updateTimePos = throttle((v: number) => {
      dispatch.context.setTimePos(v ?? 0)
    }, frameTime)

    timePosProp.observe(throttle(updateTimePos, frameTime))

    durationProp.observe((v) => {
      dispatch.context.setDuration(v || 0)
    })

    pathProp.observe((v) => {
      v = normalize(v ?? "")
      if (v?.length && v !== path) {
        dispatch.context.addHistory(v)
        loadRemoteSubtitle(v)
        dispatch.context.setPath(v)
        const d = dirname(v)
        if (!d) {
          return
        }
        const list = getPlayableList(autoloadConfig, v, d, getExtName(v) || "")
        const playIndex = list.indexOf(v)
        dispatch.context.setPlaylist(list, playIndex === -1 ? 0 : playIndex)
      }
    })

    const cb = throttle((v) => {
      dispatch.context.setMousePos(v)
    }, frameTime)

    muteProp.observe((v) => {
      dispatch.context.setMute(v)
    })

    pauseProp.observe((v) => {
      dispatch.context.setPause(v)
    })

    mousePosProp.observe(cb, isEqual)

    osdDimensionsProp.observe(
      throttle((v) => {
        dispatch.context.setOsdDimensions(v)
      }, frameTime),
      isEqual,
    )

    registerScriptMessage("open-dialog", () => {
      const v = openDialog()[0]
      if (v) {
        dispatch.context.playVideo(v)
      }
    })

    registerScriptMessage("volume-change", (e) => {
      const v = Number.parseFloat(`${e}`)
      const s = clamp(volumeRef.current + v, 0, volumeMax)
      dispatch.context.setVolume(s)
      setPropertyNumber("volume", s)
      printAndOsd(`volume: ${s}`, 2)
    })

    registerScriptMessage("fontsize-change", (e) => {
      const v = Number.parseFloat(`${e}`)
      const s = clamp(fontSizeRef.current + v, minFontSize, maxFontSize)
      dispatch.context.setFontSize(s)
      printAndOsd(`fontsize: ${s}`, 2)
    })

    registerScriptMessage("speed-change", (e) => {
      const v = Number.parseFloat(`${e}`)
      const s = clamp(speedRef.current + v, speedMin, speedMax)
      dispatch.context.setSpeed(s)
      setPropertyNumber("speed", s)
      printAndOsd(`speed: ${s}`, 2)
    })
    registerScriptMessage("crop", () => {
      dispatch.context.setShowCrop(true)
    })
    registerScriptMessage("cancel", () => {
      dispatch.context.setShowCrop(false)
      dispatch.context.setCropPoints([])
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
  const subScale = getPropertyNumber("sub-sclae", 1)

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
      (translateStyle.subFontSize || fontSize)) * subScale

  const subColor =
    getColor("sub-color") ?? (translateStyle.subColor || "#FFFFFFFF")
  const subBold =
    getPropertyBool("sub-bold") ?? (translateStyle.subBold || false)
  const subOutlineSize =
    getPropertyNumber("sub-outline-size") ??
    (translateStyle.subOutlineSize || 0)
  const subOutlineColor =
    getColor("sub-outline-color") ?? translateStyle.subOutlineColor
  const h = useSelector(IconButtonSizeSelector)

  return (
    <>
      <Tooltip
        backgroundColor={tooltip.backgroundColor}
        font={tooltip.font}
        fontSize={smallFontSize}
        color={tooltip.color}
        padding={tooltip.padding}
        display="flex"
        justifyContent="center"
        alignItems="center"
        zIndex={style[mode].tooltip.zIndex}
        maxWidth={style[mode].tooltip.maxWidth}
      />

      <Box
        id="mpv-easy-main"
        display="flex"
        width="100%"
        height="100%"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="start"
        position="relative"
        onMouseDown={(e) => {
          if (showCrop) {
            console.log(
              "showCrop",
              e.clientX,
              e.clientY,
              mousePos.x,
              mousePos.y,
            )
            if (cropPoints.length < 2) {
              dispatch.context.setCropPoints([
                ...cropPoints,
                [mousePos.x, mousePos.y],
              ])
            } else {
              console.log("crop point too large")
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
            dispatch.context.setPlaylistHide(true)
            dispatch.context.setHistoryHide(true)
          }
        }}
      >
        <Toolbar ref={toolbarRef} hide={hide || showCrop} />
        <Element ref={elementRef} hide={hide || showCrop} />
        <VoiceControl ref={volumeDomRef} hide={hide || showCrop} />
        {!clickMenuStyle.disable && <ClickMenu ref={menuRef} hide={menuHide} />}
        <Playlist />
        <History />
        <Speed />
        {showCrop && (
          <Crop
            mouseX={mousePos.x}
            mouseY={mousePos.y}
            lineColor={cropConfig.lineColor}
            lineWidth={cropConfig.lineWidth}
            osdHeight={osdDimensionsProp.value?.h || 0}
            osdWidth={osdDimensionsProp.value?.w || 0}
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
