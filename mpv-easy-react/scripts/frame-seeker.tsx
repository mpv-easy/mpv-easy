import "@mpv-easy/polyfill"
import React, { useEffect, useRef, useState } from "react"
import {
  getOptions,
  registerScriptMessage,
  getAssScale,
  setPropertyBool,
  PropertyBool,
} from "@mpv-easy/tool"
import {
  Frame,
  defaultConfig,
  getFPS,
  getFrame,
  getOffset,
  seekFrame,
} from "@mpv-easy/frame-seeker"
import { Box, render, useMousePos, useProperty } from "@mpv-easy/react"

const {
  frameSeekerEventName,
  color,
  activeColor,
  frames,
  bottom,
  radius,
  borderSize,
  zIndex,
  ui,
} = {
  ...defaultConfig,
  ...getOptions("mpv-easy-frame", {
    "frame-event-name": {
      type: "string",
      key: "frameSeekerEventName",
    },
    color: {
      type: "color",
      key: "color",
    },
    "active-color": {
      type: "color",
      key: "activeColor",
    },
    "border-size": {
      type: "number",
      key: "borderSize",
    },
    bottom: {
      type: "number",
      key: "bottom",
    },
    radius: {
      type: "number",
      key: "radius",
    },
    zIndex: {
      type: "number",
      key: "zIndex",
    },
    ui: {
      type: "boolean",
      key: "ui",
    },
  }),
}

const oscProp = new PropertyBool("osc")

function App() {
  const [show, setShow] = useState(false)
  const [active, setActive] = useState(false)
  const { w, h } = useProperty("osd-dimensions")[0]
  const scale = getAssScale()
  const leftOffset = ((w - radius) / 2) * scale
  const topOffset = (h - bottom) * scale
  const oscRef = useRef(false)
  useEffect(() => {
    registerScriptMessage(frameSeekerEventName, () => {
      setShow((v) => {
        if (v) {
          oscProp.value = oscRef.current
          oscRef.current = false
        } else {
          oscRef.current = oscProp.value
          oscProp.value = false
        }
        return !v
      })
    })
  }, [])
  const clickX = useRef(0)
  const fpsRef = useRef(0)
  const fps = getFPS()
  if (fps !== 0) {
    fpsRef.current = fps
  }
  const [base, setBase] = useState(0)
  const { x = 0 } = useMousePos()
  const offset = getOffset(w, clickX.current, x)
  if (active) {
    const target = (base + (offset * frames) / 2) | 0
    seekFrame(target, fpsRef.current)
  }
  return (
    <Box
      position="absolute"
      display="flex"
      width={w}
      height={h}
      zIndex={zIndex}
      left={0}
      top={0}
      onClick={() => {
        if (!show) {
          return
        }
        clickX.current = x
        setPropertyBool("pause", true)
        setActive((v) => !v)
        setBase(getFrame(fpsRef.current))
      }}
    >
      {show && ui && (
        <Frame
          left={leftOffset}
          top={topOffset}
          color={active ? activeColor : color}
          radius={radius}
          offset={active ? offset : 0}
          zIndex={zIndex}
          borderSize={borderSize}
        />
      )}
    </Box>
  )
}

render(<App />, {
  // showFps: true,
})
