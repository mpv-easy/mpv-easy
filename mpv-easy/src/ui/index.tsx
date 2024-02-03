import React, { useEffect, useRef, useState } from "react"
import { Uosc } from "./uosc"
import { Osc } from "./osc"
import { Toolbar } from "./toolbar"
import { pluginName } from "../main"
import { Box, DOMElement, Tooltip } from "@mpv-easy/ui"
import { useSelector, useDispatch } from "react-redux"
import {
  Dispatch,
  RootState,
  modeSelector,
  mousePosSelector,
  mousePosThrottleSelector,
  pathSelector,
  styleSelector,
  timePosThrottleSelector,
  toolbarStyleSelector,
  uiNameSelector,
} from "../store"
import {
  PropertyBool,
  PropertyNumber,
  PropertyString,
  PropertyNative,
  MousePos,
  MpvPropertyTypeMap,
  getProperty,
  isAudio,
  isImage,
  isVideo,
  joinPath,
  readdir,
  command,
  commandNative,
  getPropertyNumber,
  registerEvent,
  getPropertyNative,
  getOs,
} from "@mpv-easy/tool"
import { throttle, isEqual } from "lodash-es"
import { ClickMenu } from "./click-menu"
import { Playlist } from "./playlist"
import { getPlayableList } from "@mpv-easy/autoload"

const windowMaximizedProp = new PropertyBool("window-maximized")
const fullscreenProp = new PropertyBool("fullscreen")
const timePosProp = new PropertyNumber("time-pos")
const durationProp = new PropertyNumber("duration")
const pauseProp = new PropertyBool("pause")
const pathProp = new PropertyString("path")
const mousePosProp = new PropertyNative<MousePos>("mouse-pos")
const muteProp = new PropertyBool("mute")
const osdDimensionsProp = new PropertyNative<
  MpvPropertyTypeMap["osd-dimensions"]
>("osd-dimensions")

export function hasPoint(
  node: DOMElement | null,
  x: number,
  y: number,
): boolean {
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

export function Easy() {
  const dispatch = useDispatch<Dispatch>()
  const timePosThrottle = useSelector(timePosThrottleSelector)
  const mousePosThrottle = useSelector(mousePosThrottleSelector)
  const path = useSelector(pathSelector)
  useEffect(() => {
    windowMaximizedProp.observe((v) => {
      dispatch.context.setWindowMaximized(v)
    })

    fullscreenProp.observe((v) => {
      dispatch.context.setFullscreen(v)
    })

    timePosProp.observe(
      throttle(
        (v) => {
          dispatch.context.setTimePos(v || 0)
        },
        timePosThrottle,
        { leading: false, trailing: true },
      ),
    )

    durationProp.observe((v) => {
      dispatch.context.setDuration(v || 0)
    })

    pathProp.observe((v) => {
      // const oldPath = getProperty("path")
      // console.log("pathProp: ", v, path, getProperty("path"))
      if (v !== path) {
        dispatch.context.setPath(v)
        if (v?.length) {
          const list = getPlayableList(v)
          // console.log("new list: ", list.join(", "))
          dispatch.context.setPlaylist(list)
        }
      }
    })

    const cb = throttle(
      (v) => {
        dispatch.context.setMousePos(v)
      },
      mousePosThrottle,
      { leading: false, trailing: true },
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
        mousePosThrottle,
        { leading: false, trailing: true },
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
  }[uiName]

  const tooltip = style[mode].tooltip

  const toolbarRef = useRef<DOMElement>(null)
  const elementRef = useRef<DOMElement>(null)
  const menuRef = useRef<{ setHide: (v: boolean) => void }>(null)

  const [menuHide, setMenuHide] = useState(true)

  const { x, y } = mousePos
  const [hide, setHide] = useState(false)
  const hideHandle = useRef(-1)
  const mouseInUI =
    hasPoint(toolbarRef.current, x, y) || hasPoint(elementRef.current, x, y)

  if (mouseInUI) {
    clearTimeout(hideHandle.current)
    if (hide) {
      setHide(false)
    }
  } else {
    hideHandle.current = +setTimeout(() => {
      setHide(true)
    }, toolbar.autoHideDelay ?? 1000)
  }

  return (
    <>
      {tooltip.enable ? (
        <Tooltip
          backgroundColor={tooltip.backgroundColor}
          font={tooltip.font}
          fontSize={tooltip.fontSize}
          color={tooltip.color}
          padding={tooltip.padding}
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex={style[mode].tooltip.zIndex}
        />
      ) : (
        <></>
      )}

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
          // e.stopPropagation()
          // console.log("mpv-easy-main click: ", e.target.attributes.id, e.target.attributes.text, e.target.attributes.title)
          const isEmptyClick =
            e.target.attributes.id === "mpv-easy-main" ||
            e.target.attributes.id === undefined
          setTimeout(() => {
            menuRef.current?.setHide(true)
          }, 16)

          dispatch.context.setPlaylistHide(true)
          if (isEmptyClick) {
            // console.log("click empty")
          }
        }}
      >
        <Toolbar ref={toolbarRef} hide={hide} />
        <Element ref={elementRef} hide={hide} />
        <ClickMenu ref={menuRef} hide={menuHide} />
        <Playlist />
      </Box>
    </>
  )
}
