import "@mpv-easy/polyfill"
import {
  detectFfmpeg,
  detectWhisperModel,
  getOptions,
  getProperty,
  normalize,
  registerScriptMessage,
  showNotification,
  subAdd,
  VideoTypes,
  whisper,
  whisperConfig,
} from "@mpv-easy/tool"

const {
  model = detectWhisperModel(),
  gpu,
  language,
  format = "srt",
} = {
  ...getOptions("mpv-easy-whisper", {
    model: {
      type: "string",
      key: "model",
    },
    gpu: {
      type: "boolean",
      key: "gpu",
    },
    language: {
      type: "string",
      key: "language",
    },
    format: {
      type: "string",
      key: "format",
    },
  }),
}

registerScriptMessage("whisper", async () => {
  const p = normalize(getProperty("path") || "")
  if (!p) {
    return
  }
  const videoType = VideoTypes.find((i) => p?.endsWith(`.${i}`))
  if (!videoType) {
    return
  }

  const ffmpeg = detectFfmpeg()
  if (!ffmpeg) {
    return
  }

  const destination = p.replace(`.${videoType}`, `.${format}`)
  if (!model) {
    return
  }
  const config: whisperConfig = {
    model,
    destination,
    // @ts-expect-error
    format,
    gpu,
    language,
  }
  const r = await whisper(p, config, ffmpeg)
  showNotification("Whisper start", 5)
  if (r) {
    showNotification("Whisper success", 5)
    subAdd(destination)
  } else {
    showNotification("Whisper failed", 5)
  }
})
