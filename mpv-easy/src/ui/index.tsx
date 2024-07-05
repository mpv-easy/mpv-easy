import React, { useEffect, useRef, useState } from "react"
import { Uosc } from "./uosc"
import { Osc } from "./osc"
import { Oscx } from "./oscx"
import { Toolbar } from "./toolbar"
import { Box, type MpDom, Tooltip } from "@mpv-easy/ui"
import { useSelector, useDispatch } from "react-redux"
import {
  type Dispatch,
  audoloadConfigSelector,
  fpsSelector,
  modeSelector,
  mousePosSelector,
  pathSelector,
  smallFontSizeSelector,
  styleSelector,
  toolbarStyleSelector,
  uiNameSelector,
  clickMenuStyleSelector,
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
  dir,
  getMpvPlaylist,
  loadRemoteSubtitle,
} from "@mpv-easy/tool"
import { throttle, isEqual } from "lodash-es"
import { ClickMenu } from "./click-menu"
import { Playlist } from "./playlist"
import { getPlayableList } from "@mpv-easy/autoload"
import { VoiceControl } from "./voice-control"
import { useFirstMountState } from "react-use"
import { History } from "./history"
import { Speed } from "./speed"

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

const timePosFullProp = new PropertyNumber("time-pos/full")
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
  skipFirstRender: boolean
  fontSize: number
}
export const Easy = React.memo((props: Partial<EasyProps>) => {
  const dispatch = useDispatch<Dispatch>()
  const fps = useSelector(fpsSelector)
  const path = useSelector(pathSelector)
  const autoloadConfig = useSelector(audoloadConfigSelector)
  useEffect(() => {
    if (props.fontSize) {
      dispatch.context.setFontSize(props.fontSize)
    }

    dispatch.context.addHistory(path)
    loadRemoteSubtitle(path)

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

    const updateTimePos = throttle(
      (v: number) => {
        dispatch.context.setTimePos(v ?? 0)
      },
      1000 / fps,
      { leading: true, trailing: true },
    )

    timePosProp.observe(throttle(updateTimePos))

    durationProp.observe((v) => {
      dispatch.context.setDuration(v || 0)
    })

    pathProp.observe((v) => {
      v = normalize(v ?? "")
      if (v?.length && v !== path) {
        dispatch.context.addHistory(v)
        loadRemoteSubtitle(v)
        dispatch.context.setPath(v)
        const d = dir(v)
        if (!d) {
          return
        }
        const list = getPlayableList(autoloadConfig, d)
        const playIndex = list.indexOf(v)
        dispatch.context.setPlaylist(list, playIndex === -1 ? 0 : playIndex)
      }
    })

    const cb = throttle(
      (v) => {
        dispatch.context.setMousePos(v)
      },
      1000 / fps,
      { leading: true, trailing: true },
    )

    muteProp.observe((v) => {
      dispatch.context.setMute(v)
    })

    pauseProp.observe((v) => {
      dispatch.context.setPause(v)
    })

    mousePosProp.observe(cb, isEqual)

    osdDimensionsProp.observe(
      throttle(
        (v) => {
          dispatch.context.setOsdDimensions(v)
        },
        1000 / fps,
        { leading: true, trailing: true },
      ),
      isEqual,
    )
  }, [])

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
  const volumeRef = useRef<MpDom>(null)
  const [menuHide, setMenuHide] = useState(true)

  const { x, y } = mousePos
  const [hide, setHide] = useState(!!props.initHide)
  const hideHandle = useRef(-1)
  const mouseInUI = [
    toolbarRef.current,
    elementRef.current,
    volumeRef.current,
  ].some((i) => hasPoint(i, x, y))

  if (mouseInUI) {
    clearTimeout(hideHandle.current)
    if (hide) {
      setHide(false)
    }
  } else {
    hideHandle.current = +setTimeout(() => {
      setHide(true)
    }, toolbar.autoHideDelay ?? 5000)
  }

  const isFirstMount = useFirstMountState() && props.skipFirstRender

  const fontSize = useSelector(smallFontSizeSelector)
  const clickMenuStyle = useSelector(clickMenuStyleSelector)
  return (
    <>
      <Tooltip
        backgroundColor={tooltip.backgroundColor}
        font={tooltip.font}
        fontSize={fontSize}
        color={tooltip.color}
        padding={tooltip.padding}
        display="flex"
        justifyContent="center"
        alignItems="center"
        zIndex={style[mode].tooltip.zIndex}
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
        onClick={(e) => {
          const isEmptyClick =
            e.target?.attributes.id === "mpv-easy-main" ||
            e.target?.attributes.id === undefined
          setTimeout(() => {
            menuRef.current?.setHide(true)
          }, 16)

          dispatch.context.setPlaylistHide(true)
          dispatch.context.setHistoryHide(true)
          if (isEmptyClick) {
            // console.log("click empty")
          }
        }}
      >
        <Toolbar ref={toolbarRef} hide={hide || isFirstMount} />
        <Element ref={elementRef} hide={hide || isFirstMount} />
        <VoiceControl ref={volumeRef} hide={hide || isFirstMount} />
        {!clickMenuStyle.disable && <ClickMenu ref={menuRef} hide={menuHide} />}
        <Playlist />
        <History />
        <Speed />
      </Box>
    </>
  )
})
