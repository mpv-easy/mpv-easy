import "@mpv-easy/polyfill"
import { getOptions, registerScriptMessage } from "@mpv-easy/tool"
import { copyTime, defaultConfig } from "@mpv-easy/copy-time"

const { copyTimeEventName } = {
  ...defaultConfig,
  ...getOptions("mpv-easy-copy-time", {
    "copy-time-event-name": {
      type: "string",
      key: "copyTimeEventName",
    },
  }),
}

registerScriptMessage(copyTimeEventName, async () => {
  copyTime()
})
