import "@mpv-easy/polyfill"
import {
  getOptions,
  registerScriptMessage,
  updatePlaylist,
} from "@mpv-easy/tool"
import { clipboardPlay, defaultConfig, pluginName } from "./index"
import {
  pluginName as autoloadName,
  getPlayableList,
  defaultConfig as autoloadConfig,
} from "@mpv-easy/autoload"
import {
  pluginName as jellyfinName,
  defaultConfig as jellyfinConfig,
} from "@mpv-easy/jellyfin"

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
  const context = {
    [jellyfinName]: jellyfinConfig,
    [autoloadName]: autoloadConfig,
    [pluginName]: defaultConfig,
  }
  clipboardPlay(context, updatePlaylist)
})
