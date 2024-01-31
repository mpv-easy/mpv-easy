import React, { useEffect, useRef, useState } from "react"
import { Uosc } from "./uosc"
import { Osc } from "./osc"
import { Toolbar } from "./toolbar"
import { pluginName } from "../main"
import { Box, DOMElement, Tooltip } from "@mpv-easy/ui"
import { useSelector, useDispatch } from "react-redux"
import { Dispatch, RootStore } from "../store"
import {
  PropertyBool,
  PropertyNumber,
  PropertyString,
  PropertyNative,
  MousePos,
} from "@mpv-easy/tool"
import { throttle, isEqual } from "lodash-es"

const windowMaximizedProp = new PropertyBool("window-maximized")
const fullscreenProp = new PropertyBool("fullscreen")
const timePosProp = new PropertyNumber("time-pos")
const durationProp = new PropertyNumber("duration")
const pauseProp = new PropertyBool("pause")
const pathProp = new PropertyString("path")
const mousePosProp = new PropertyNative<MousePos>("mouse-pos")
const muteProp = new PropertyBool("mute")

function hasPoint(node: DOMElement | null, x: number, y: number): boolean {
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
  const timePosThrottle = useSelector(
    (store: RootStore) => store.context[pluginName].state.timePosThrottle,
  )
  const mousePosThrottle = useSelector(
    (store: RootStore) => store.context[pluginName].state.mousePosThrottle,
  )

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

    pathProp.observe((v) => {
      dispatch.context.setPath(v || "")
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
  }, [])

  const style = useSelector(
    (store: RootStore) => store.context[pluginName].style,
  )
  const mode = useSelector((store: RootStore) => store.context[pluginName].mode)
  const toolbar = useSelector(
    (store: RootStore) => store.context[pluginName].style[mode].toolbar,
  )

  const state = useSelector(
    (store: RootStore) => store.context[pluginName].state,
  )
  const elemName = useSelector(
    (store: RootStore) => store.context[pluginName].name,
  )

  const mousePos = useSelector(
    (store: RootStore) => store.context[pluginName].player.mousePos,
  )

  const Element = {
    osc: Osc,
    uosc: Uosc,
  }[elemName]

  const tooltip = style[mode].tooltip

  const toolbarRef = useRef<DOMElement>(null)
  const elementRef = useRef<DOMElement>(null)

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
      <Tooltip
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        text={state.tooltipText}
        hide={state.tooltipHide || hide}
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

      <Box
        display="flex"
        width="100%"
        height="100%"
        justifyContent="start"
        alignItems="start"
      >
        <Toolbar ref={toolbarRef} hide={hide} />
        <Element ref={elementRef} hide={hide} />
      </Box>
    </>
  )
}
