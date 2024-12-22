import "@mpv-easy/polyfill"
import { autoload, defaultConfig } from "./index"
import {
  updatePlaylist,
  getMpvPlaylist,
  registerEvent,
  getOptions,
} from "@mpv-easy/tool"

const { image, video, audio, maxSize } = {
  ...defaultConfig,
  ...getOptions("mpv-autoload", {
    image: {
      type: "boolean",
      key: "image",
    },
    video: {
      type: "boolean",
      key: "video",
    },
    audio: {
      type: "boolean",
      key: "audio",
    },
    maxSize: {
      type: "number",
      key: "maxSize",
    },
  }),
}
registerEvent("start-file", () => {
  autoload(updatePlaylist, getMpvPlaylist, {
    image,
    video,
    audio,
    maxSize,
  })
})
