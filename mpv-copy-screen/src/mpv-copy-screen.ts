import "@mpv-easy/polyfill"
import { getOptions, registerScriptMessage } from "@mpv-easy/tool"
import { copyScreen, defaultConfig } from "./index"

const { copyScreenEventName, format } = {
  ...defaultConfig,
  ...getOptions("mpv-copy-screen", {
    "copy-screen-event-name": {
      type: "string",
      key: "copyScreenEventName",
    },
    format: {
      type: "string",
      key: "format",
    },
  }),
}

registerScriptMessage(copyScreenEventName, async () => {
  copyScreen(format)
})
