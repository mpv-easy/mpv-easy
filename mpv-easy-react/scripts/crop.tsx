import "@mpv-easy/polyfill"
import React, { useEffect, useRef, useState } from "react"
import {
  cropImage,
  detectFfmpeg,
  getOptions,
  showNotification,
  registerScriptMessage,
} from "@mpv-easy/tool"
import {
  Crop,
  defaultConfig,
  getCropImagePath,
  getCropRect,
} from "@mpv-easy/crop"
import {
  Box,
  DefaultFps,
  render,
  useProperty,
  usePropertyNumber,
  usePropertyString,
} from "@mpv-easy/react"

const {
  outputEventName,
  cropEventName,
  cancelEventName,
  outputDirectory,
  cropImageFormat,
  lineWidth,
  lineColor,
  maskColor,
  linePadding,
  lineColorHover,
  labelFontSize,
} = {
  ...defaultConfig,
  ...getOptions("crop", {
    "crop-event-name": {
      type: "string",
      key: "cropEventName",
    },
    "output-event-name": {
      type: "string",
      key: "outputEventName",
    },
    "cancel-event-name": {
      type: "string",
      key: "cancelEventName",
    },
    "line-color": {
      type: "color",
      key: "lineColor",
    },
    "line-color-hover": {
      type: "color",
      key: "lineColorHover",
    },
    "mask-color": {
      type: "color",
      key: "maskColor",
    },
    "line-width": {
      type: "number",
      key: "lineWidth",
    },
    "label-font-size": {
      type: "number",
      key: "labelFontSize",
    },
    "line-padding": {
      type: "number",
      key: "linePadding",
    },
    "output-directory": {
      type: "string",
      key: "outputDirectory",
    },
    "crop-image-format": {
      type: "string",
      key: "cropImageFormat",
    },
  }),
}

function App() {
  const [showCrop, setShowCrop] = useState(false)
  const [points, setPoints] = useState<[number, number][]>([])
  const { w, h } = useProperty("osd-dimensions")[0]

  const mousePos = useProperty("mouse-pos", {
    x: 0,
    y: 0,
    hover: false,
  })[0]
  const x = mousePos.x || 0
  const y = mousePos.y || 0
  const path = usePropertyString("path", "")[0]
  const timePos = usePropertyNumber("time-pos", 0)[0]
  const cropRef = useRef<(() => void) | null>(null)

  const hack = useState(0)[1]
  cropRef.current = async () => {
    if (!path.length) {
      showNotification("video not found")
      return
    }
    const ffmpeg = detectFfmpeg()
    if (!ffmpeg) {
      showNotification("ffmpeg not found")
      return
    }
    if (points.length === 2) {
      const rect = getCropRect(points)
      if (!rect) {
        if (!rect) {
          showNotification("invalid video cropping region")
          return
        }
      }
      const outputPath = getCropImagePath(
        path,
        timePos,
        cropImageFormat,
        rect,
        outputDirectory,
      )
      const ok = await cropImage(rect, outputPath, ffmpeg)
      if (!ok) {
        showNotification("failed to crop image")
      } else {
        showNotification("crop image finish")
      }
    }
    setPoints([])
    setShowCrop(false)
  }

  useEffect(() => {
    registerScriptMessage(cropEventName, () => {
      setPoints([])
      setShowCrop(true)
    })
    registerScriptMessage(cancelEventName, () => {
      setShowCrop(false)
      setPoints([])
    })
    registerScriptMessage(outputEventName, () => {
      cropRef.current?.()
    })

    const h = +setInterval(() => {
      // FIXME: hot code for better performance
      hack((i) => (i + 1) % 1000)
    }, 1000 / DefaultFps)

    return () => {
      clearInterval(h)
    }
  }, [])
  return (
    <Box
      position="absolute"
      width={w}
      height={h}
      onMouseDown={() => {
        if (points.length >= 2) {
          return
        }
        const newPoints = [...points]
        newPoints.push([x, y])
        setPoints(newPoints)
      }}
    >
      {showCrop && (
        <Crop
          mouseX={x}
          mouseY={y}
          lineWidth={lineWidth}
          linePadding={linePadding}
          lineColorHover={lineColorHover}
          lineColor={lineColor}
          osdWidth={w}
          osdHeight={h}
          points={points}
          maskColor={maskColor}
          labelFontSize={labelFontSize}
          zIndex={1024}
          onChange={setPoints}
        />
      )}
    </Box>
  )
}

render(<App />, {
  // showFps: true,
})
