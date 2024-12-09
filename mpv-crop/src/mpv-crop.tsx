import "@mpv-easy/polyfill"
import React, { useEffect, useRef, useState } from "react"
import {
  cropImage,
  detectFfmpeg,
  getOptions,
  MousePos,
  MpvPropertyTypeMap,
  printAndOsd,
  registerScriptMessage,
} from "@mpv-easy/tool"
import { Crop, defaultConfig, getCropImagePath, getCropRect } from "./index"
import {
  Box,
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
} = {
  ...defaultConfig,
  ...getOptions("mpv-crop", {
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
    "mask-color": {
      type: "color",
      key: "maskColor",
    },
    "line-width": {
      type: "number",
      key: "lineWidth",
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
  const osd = useProperty<MpvPropertyTypeMap["osd-dimensions"]>(
    "osd-dimensions",
    {
      w: 0,
      h: 0,
    },
  )[0]

  const w = osd.w || 0
  const h = osd.h || 0

  const mousePos = useProperty<MousePos>("mouse-pos", {
    x: 0,
    y: 0,
    hover: false,
  })[0]
  const x = mousePos.x || 0
  const y = mousePos.y || 0
  const path = usePropertyString("path", "")[0]
  const timePos = usePropertyNumber("time-pos", 0)[0]
  const cropRef = useRef<(() => void) | null>(null)

  cropRef.current = async () => {
    if (!path.length) {
      printAndOsd("video not found")
      return
    }
    const ffmpeg = detectFfmpeg()
    if (!ffmpeg) {
      printAndOsd("ffmpeg not found")
      return
    }
    if (points.length === 2) {
      const rect = getCropRect(points)
      const outputPath = getCropImagePath(
        path,
        timePos,
        cropImageFormat,
        rect,
        outputDirectory,
      )
      const ok = await cropImage(path, timePos, rect, outputPath, ffmpeg)
      if (!ok) {
        printAndOsd("failed to crop image")
      } else {
        printAndOsd("crop image finish")
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
  }, [])
  return (
    <Box
      position="absolute"
      width={w}
      height={h}
      onClick={() => {
        const newPoints = [...points]
        newPoints.push([x, y])
        while (newPoints.length > 2) {
          newPoints.shift()
        }
        setPoints(newPoints)
      }}
    >
      {showCrop && (
        <Crop
          mouseX={x}
          mouseY={y}
          lineWidth={lineWidth}
          lineColor={lineColor}
          osdWidth={w}
          osdHeight={h}
          points={points}
          maskColor={maskColor}
          zIndex={1024}
        />
      )}
    </Box>
  )
}

render(<App />)
