import "@mpv-easy/polyfill"
import {
  appendPoint,
  defaultConfig,
  getVideoSegment,
  getCutVideoPath,
} from "@mpv-easy/cut"
import {
  cutVideo,
  detectFfmpeg,
  getOptions,
  getProperty,
  GifConfig,
  PropertyNumber,
  registerScriptMessage,
} from "@mpv-easy/tool"
import { isRemote } from "@mpv-easy/tool"
import { hideNotification, showNotification } from "@mpv-easy/tool"

const {
  outputEventName,
  cutEventName,
  cancelEventName,
  outputDirectory,
  outputGifEventName,
  fps,
  flags,
  maxWidth,
} = {
  ...defaultConfig,
  ...getOptions("mpv-easy-cut", {
    "cut-event-name": {
      type: "string",
      key: "cutEventName",
    },
    "output-event-name": {
      type: "string",
      key: "outputEventName",
    },
    "output-gif-event-name": {
      type: "string",
      key: "outputGifEventName",
    },
    "cancel-event-name": {
      type: "string",
      key: "cancelEventName",
    },
    "output-directory": {
      type: "string",
      key: "outputDirectory",
    },
    fps: {
      type: "number",
      key: "fps",
    },
    flags: {
      type: "string",
      key: "flags",
    },
    "max-width": {
      type: "number",
      key: "maxWidth",
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

async function output(gitConfig?: GifConfig) {
  const path = getProperty("path")
  if (!path) {
    showNotification("video not found")
    return
  }
  if (isRemote(path)) {
    showNotification("cut not support remote video")
    return
  }
  const segment = getVideoSegment(points)
  if (!segment) {
    showNotification("video segment not found")
    return
  }
  const ffmpeg = detectFfmpeg()
  if (!ffmpeg) {
    showNotification("ffmpeg not found")
    return
  }

  const outputPath = getCutVideoPath(path, segment, undefined, outputDirectory)
  const ok = await cutVideo(segment, path, outputPath, gitConfig, ffmpeg)
  hideNotification()
  if (!ok) {
    showNotification("failed to output")
    return
  }
  showNotification("output finish")
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

registerScriptMessage(outputGifEventName, () => {
  output({
    fps,
    flags,
    maxWidth,
  })
})
