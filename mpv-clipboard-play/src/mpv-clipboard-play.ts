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
  ...getOptions("clipboard-play-event-name", {
    "clipboard-play-event-name": {
      type: "string",
      key: "clipboardPlayEventName",
    },
  }),
}
console.log("clipboardPlayEventName", clipboardPlayEventName)
registerScriptMessage(clipboardPlayEventName, async () => {
  const s = (await getClipboard()).trim().replace(/\\/g, "/")
  console.log("s", s)
  if (s.length && isRemote(s)) {
    showNotification(`play ${s}`)
    loadfile(s)
  }
})
