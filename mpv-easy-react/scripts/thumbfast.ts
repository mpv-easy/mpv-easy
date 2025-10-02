import "@mpv-easy/polyfill"
import {
  getOptions,
  getPropertyNative,
  observeProperty,
  overlayAdd,
  overlayRemove,
  registerEvent,
  registerScriptMessage,
  scriptMessage,
} from "@mpv-easy/tool"
import {
  defaultConfig,
  getThumbFastVideoPath,
  ThumbFast,
} from "@mpv-easy/thumbfast"

const {
  path,
  maxHeight,
  maxWidth,
  format,
  startTime,
  network,
  lifetime,
  overlayId,
  scaleFactor,
  noConfig,
} = {
  ...defaultConfig,
  ...getOptions("mpv-easy-thumbfast", {
    path: {
      type: "string",
      key: "path",
    },
    format: {
      type: "string",
      key: "format",
    },
    "max-width": {
      type: "number",
      key: "maxWidth",
    },
    "max-height": {
      type: "number",
      key: "maxHeight",
    },
    "start-time": {
      type: "number",
      key: "startTime",
    },
    "hr-seek": {
      type: "boolean",
      key: "hrSeek",
    },
    network: {
      type: "boolean",
      key: "network",
    },
    lifetime: {
      type: "number",
      key: "lifetime",
    },
    "overlay-id": {
      type: "number",
      key: "overlayId",
    },
    "scale-factor": {
      type: "number",
      key: "scaleFactor",
    },
    "no-config": {
      type: "boolean",
      key: "noConfig",
    },
  }),
}

let thumb: ThumbFast
function getJson() {
  const json = JSON.stringify({
    width: thumb.thumbWidth,
    height: thumb.thumbHeight,
    scale_factor: scaleFactor,
    disabled: false,
    available: true,
    socket: thumb.ipcId,
    thumbnail: thumb.path,
    overlay_id: overlayId,
  })
  // console.log('getJson', json)
  return json
}

function shutdown() {
  // console.log('shutdown')
  clear()
  thumb?.exit()
}

function clear() {
  // console.log('clear')
  overlayRemove(overlayId)
}

function start() {
  // console.log('start')
  initThumb()
  for (const prop of [
    "display-hidpi-scale",
    "video-out-params",
    "video-params",
    "vf",
    "tone-mapping",
    "demuxer-via-network",
    "stream-open-filename",
    "macos-app-activation-policy",
    "current-vo",
    "video-rotate",
    "video-crop",
    "path",
    "vid",
    "edition",
    "duration",
  ]) {
    observeProperty(prop, "native", update)
  }

  // registerScriptMessage("thumb", update);
  registerScriptMessage("clear", clear)

  registerEvent("file-loaded", update)
  registerEvent("shutdown", shutdown)

  registerScriptMessage("thumb", updaeThumb)
}

function initThumb() {
  // console.log('initThumb')
  const params = getPropertyNative("video-params")
  if (thumb) {
    thumb.exit()
  }
  thumb = new ThumbFast({
    path,
    maxHeight,
    maxWidth,
    lifetime,
    // FIXME: support enum

    format,
    startTime,
    network,
    videoHeight: params?.h || 0,
    videoWidth: params?.w || 0,
    noConfig,
  })
  scriptMessage("thumbfast-info", getJson())
}
const update = () => {
  const params = getPropertyNative("video-params")
  const shouldUdpate =
    (params &&
      (params.w !== thumb.videoWidth || params.h !== thumb.videoHeight)) || // video size changed
    thumb.videoPath !== getThumbFastVideoPath(network) || // video path changed
    !thumb // thumbfast instance changed

  if (shouldUdpate) {
    initThumb()
  }
}

let lastX = 0
let lastY = 0
let lastTime = 0
const updaeThumb = (time: string, x: string, y: string, _script: string) => {
  if (lastTime === +time && lastX === +x && lastY === +y) {
    return
  }
  lastX = +x
  lastY = +y
  lastTime = +time
  thumb?.seek(lastTime)
  overlayAdd(
    overlayId,
    lastX,
    lastY,
    thumb.path,
    0,
    "bgra",
    thumb.thumbWidth,
    thumb.thumbHeight,
    thumb.thumbWidth * 4,
    thumb.thumbWidth,
    thumb.thumbHeight,
  )
}
setTimeout(() => {
  start()
}, 16)
