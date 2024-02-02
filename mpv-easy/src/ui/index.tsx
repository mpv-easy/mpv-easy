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
function getList(path = "") {
  const dir = path.includes("\\")
    ? path?.split("\\").slice(0, -1).join("\\")
    : path?.split("/").slice(0, -1).join("/")

  const list = readdir(dir) || []
  const videoList = list
    .filter((i) => isVideo(i) || isAudio(i) || isImage(i))
    .map((i) => joinPath(dir, i).replaceAll("\\", "/"))
    .sort((a, b) => a.localeCompare(b))
  return videoList
}
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

export function autoload(videoList: string[]) {
  const path = getProperty("path") || ""
  const oldCount = getPropertyNumber("playlist-count", 1) || 1
  const playlistPos = getPropertyNumber("playlist-pos", 0) || 0
  const currentPos = videoList.indexOf(path)

  for (let i = oldCount - 1; i >= 0; i--) {
    if (i === playlistPos) {
      continue
    }
    command(`playlist-remove ${i}`)
  }

  for (const i of videoList) {
    if (i === path) {
      continue
    }
    command(`loadfile ${i} append`)
  }

  if (currentPos > 0) {
    commandNative(["playlist-move", 0, currentPos + 1])
  }
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
        { leading: true, trailing: true },
      ),
    )

    durationProp.observe((v) => {
      dispatch.context.setDuration(v || 0)
    })

    // registerEvent("start-file", (e) => {
    // console.log('start-file: e:', JSON.stringify(e))
    // console.log('playlist/count: ', getPropertyNative("playlist/count"))
    // console.log('path: ', getPropertyNative("playlist/0/playlist-path"))
    // const videoList = getList()
    // dispatch.context.setPath(pathProp.value)
    // console.log('===videoList: ', pathProp.value, videoList)
    // dispatch.context.setPlaylist(videoList)
    // if (videoList.length) {
    //   autoload(videoList)
    // }
    // })

    pathProp.observe((v) => {
      // console.log('pathProp: ', v)
      dispatch.context.setPath(v)
      if (v?.length) {
        const list = getList(v)
        // console.log("list: ", list.join(', '))
        dispatch.context.setPlaylist(list)
        autoload(list)
      }
    })

    const cb = throttle(
      (v) => {
        dispatch.context.setMousePos(v)
      },
      mousePosThrottle,
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
        mousePosThrottle,
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
