import "@mpv-easy/polyfill"
import { getOptions, registerScriptMessage } from "@mpv-easy/tool"
import { copyScreen, defaultConfig } from "@mpv-easy/copy-screen"

const { copyScreenEventName, format } = {
  ...defaultConfig,
  ...getOptions("mpv-easy-copy-screen", {
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
