import "@mpv-easy/polyfill"
import React, { useEffect, useRef, useState } from "react"
import { getOptions, registerScriptMessage, PropertyBool } from "@mpv-easy/tool"
import {
  FrameSeeker,
  FrameSeekerRef,
  defaultConfig,
} from "@mpv-easy/frame-seeker"
import { Box, render, useProperty } from "@mpv-easy/react"

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
  text,
  fontSize,
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
    text: {
      type: "boolean",
      key: "text",
    },
    fontSize: {
      type: "number",
      key: "font-size",
    },
  }),
}

const oscProp = new PropertyBool("osc")

function App() {
  const [show, setShow] = useState(false)
  const fsRef = useRef<FrameSeekerRef>(null)
  const { w, h } = useProperty("osd-dimensions")[0]
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

  return (
    <Box
      position="absolute"
      display="flex"
      width={w}
      height={h}
      zIndex={zIndex}
      left={0}
      top={0}
      onClick={(e) => {
        if (!show) {
          return
        }
        fsRef.current?.click(e.clientX)
      }}
    >
      {show && ui && (
        <FrameSeeker
          ref={fsRef}
          bottom={bottom}
          color={color}
          activeColor={activeColor}
          radius={radius}
          zIndex={zIndex}
          borderSize={borderSize}
          fontSize={fontSize}
          text={text}
          frames={frames}
        />
      )}
    </Box>
  )
}

render(<App />, {
  // showFps: true,
})
