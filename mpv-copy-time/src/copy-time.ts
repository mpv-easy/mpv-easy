import "@mpv-easy/polyfill"
import { getOptions, registerScriptMessage } from "@mpv-easy/tool"
import { copyTime, defaultConfig } from "./index"

const { copyTimeEventName } = {
  ...defaultConfig,
  ...getOptions("copy-time", {
    "copy-time-event-name": {
      type: "string",
      key: "copyTimeEventName",
    },
  }),
}

registerScriptMessage(copyTimeEventName, async () => {
  copyTime()
})
