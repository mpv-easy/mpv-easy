import "@mpv-easy/polyfill"
import { appendPoint, defaultConfig, getArea, getCutVideoPath } from "./index"
import {
  cutVideo,
  detectFfmpeg,
  getOptions,
  getProperty,
  OsdOverlay,
  printAndOsd,
  PropertyNumber,
  registerScriptMessage,
} from "@mpv-easy/tool"
import { isRemote } from "@mpv-easy/tool"
import { hideNotification, showNotification } from "@mpv-easy/tool"

const { outputEventName, cutEventName, cancelEventName, outputDirectory } = {
  ...defaultConfig,
  ...getOptions("mpv-cut", {
    "cut-event-name": {
      type: "string",
      key: "cutEventName",
    },
    "output-event-name": {
      type: "string",
      key: "outputEventName",
    },
    "cancel-event-name": {
      type: "string",
      key: "cancelEventName",
    },
    "output-directory": {
      type: "string",
      key: "outputDirectory",
    },
  }),
}
let points: number[] = []
const timePosProp = new PropertyNumber("time-pos")

function renderLabel() {
  const text = [
    points[0]?.toFixed(2) ?? "?",
    points[1]?.toFixed(2) ?? "?",
  ].join(" => ")
  showNotification(text, -1)
}

function cut() {
  points = appendPoint(points, timePosProp.value)

  renderLabel()
}

function cancel() {
  points = []
  renderLabel()
}

async function output() {
  const path = getProperty("path")
  if (!path) {
    printAndOsd("video not found")
    return
  }
  if (isRemote(path)) {
    printAndOsd("cut not support remote video")
    return
  }
  const area = getArea(points)
  if (!area) {
    printAndOsd("cut area not found")
    return
  }
  const ffmpeg = detectFfmpeg()
  if (!ffmpeg) {
    printAndOsd("ffmpeg not found")
    return
  }

  const outputPath = getCutVideoPath(path, area, outputDirectory)
  const ok = await cutVideo(area, path, outputPath, ffmpeg)
  hideNotification()
  if (!ok) {
    printAndOsd("failed to cut")
    return
  }
  printAndOsd("cut finish")
}

registerScriptMessage(cutEventName, () => {
  cut()
})

registerScriptMessage(cancelEventName, () => {
  cancel()
})

registerScriptMessage(outputEventName, () => {
  output()
})
