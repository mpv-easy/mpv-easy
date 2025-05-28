import "@mpv-easy/polyfill"
import { autoload, defaultConfig } from "@mpv-easy/autoload"
import {
  updatePlaylist,
  getMpvPlaylist,
  registerEvent,
  getOptions,
} from "@mpv-easy/tool"

const { image, video, audio, maxSize } = {
  ...defaultConfig,
  ...getOptions("mpv-easy-autoload", {
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
