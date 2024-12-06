import "@mpv-easy/polyfill"
import { appendPoint, defaultConfig, getArea, getCutVideoPath } from "./index"
import {
  cutVideo,
  detectFfmpeg,
  getAssScale,
  getOptions,
  getOsdSize,
  getProperty,
  OsdOverlay,
  printAndOsd,
  PropertyNumber,
  Rect,
  registerScriptMessage,
} from "@mpv-easy/tool"
import { AssDraw } from "@mpv-easy/assdraw"
import { isRemote } from "@mpv-easy/tool"

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
const ovl = new OsdOverlay()

function renderLabel() {
  const text = [
    points[0]?.toFixed(2) ?? "?",
    points[1]?.toFixed(2) ?? "?",
  ].join(" => ")
  ovl.data = text
  ovl.computeBounds = true
  ovl.hidden = true
  const rect = ovl.update()
  const osd = getOsdSize()
  const osdRect = new Rect(0, 0, osd?.width || 0, osd?.height || 0)
  const centerRect = osdRect.placeCenter(rect)
  const scale = getAssScale()
  ovl.data = new AssDraw()
    .pos(centerRect.x * scale, centerRect.y * scale)
    .append(text)
    .toString()
  console.log(JSON.stringify({ scale, centerRect, osd, osdRect }))
  ovl.hidden = false
  ovl.update()
}

function removeLabel() {
  ovl.data = ""
  ovl.hidden = true
  ovl.update()
  ovl.remove()
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
  removeLabel()
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
