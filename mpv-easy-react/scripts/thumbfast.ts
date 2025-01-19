import "@mpv-easy/polyfill"
import {
  getOptions,
  getPropertyNative,
  observeProperty,
  overlayAdd,
  overlayRemove,
  registerEvent,
  registerIdle,
  registerScriptMessage,
  scriptMessage,
} from "@mpv-easy/tool"
import {
  ThumbFast,
  defaultConfig,
  getThumbFastVideoPath,
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
} = {
  ...defaultConfig,
  ...getOptions("thumbfast", {
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
  observeProperty("track-list", "native", update)
  observeProperty("display-hidpi-scale", "native", update)
  observeProperty("video-out-params", "native", update)
  observeProperty("video-params", "native", update)
  observeProperty("vf", "native", update)
  observeProperty("tone-mapping", "native", update)
  observeProperty("demuxer-via-network", "native", update)
  observeProperty("stream-open-filename", "native", update)
  observeProperty("macos-app-activation-policy", "native", update)
  observeProperty("current-vo", "native", update)
  observeProperty("video-rotate", "native", update)
  observeProperty("video-crop", "native", update)
  observeProperty("path", "native", update)
  observeProperty("vid", "native", update)
  observeProperty("edition", "native", update)
  observeProperty("duration", "native", update)

  registerScriptMessage("thumb", update)
  registerScriptMessage("clear", clear)

  registerEvent("file-loaded", update)
  registerEvent("shutdown", shutdown)

  registerIdle(update)

  scriptMessage("thumbfast-info", getJson())
  registerScriptMessage("thumb", (time, x, y, script) => {
    // console.log('thumb', time, x, y, script)
    thumb?.seek(+time)
    // commandv("script-message", "thumbfast-render", getJson())
    overlayAdd(
      overlayId,
      +x,
      +y,
      thumb.path,
      0,
      "bgra",
      thumb.thumbWidth,
      thumb.thumbHeight,
      thumb.thumbWidth * 4,
      thumb.thumbWidth,
      thumb.thumbHeight,
    )
  })
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
    // @ts-ignore
    format,
    startTime,
    network,
    videoHeight: params?.h || 0,
    videoWidth: params?.w || 0,
  })
}
function update() {
  const params = getPropertyNative("video-params")
  if (
    params &&
    (params.w !== thumb.videoWidth || params.h !== thumb.videoHeight)
  ) {
    initThumb()
  }
  if (thumb.videoPath !== getThumbFastVideoPath(network)) {
    initThumb()
  }

  if (!thumb) {
    initThumb()
  }
}

setTimeout(() => {
  start()
}, 16)
