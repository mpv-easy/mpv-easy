import "@mpv-easy/polyfill"
import {
  getClipboard,
  getOptions,
  isRemote,
  loadfile,
  registerScriptMessage,
  showNotification,
} from "@mpv-easy/tool"
import { defaultConfig } from "./index"

const { clipboardPlayEventName } = {
  ...defaultConfig,
  ...getOptions("mpv-clipboard-play", {
    "clipboard-play-event-name": {
      type: "string",
      key: "clipboardPlayEventName",
    },
  }),
}

registerScriptMessage(clipboardPlayEventName, async () => {
  const s = (await getClipboard()).trim().replace(/\\/g, "/")
  if (s.length && isRemote(s)) {
    showNotification(`play ${s}`)
    loadfile(s)
  }
})
