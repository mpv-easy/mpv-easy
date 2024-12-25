import "@mpv-easy/polyfill"
import {
  getOptions,
  registerScriptMessage,
  updatePlaylist,
} from "@mpv-easy/tool"
import {
  clipboardPlay,
  defaultConfig,
  pluginName,
} from "@mpv-easy/clipboard-play"
import {
  pluginName as autoloadName,
  defaultConfig as autoloadConfig,
} from "@mpv-easy/autoload"
import {
  pluginName as jellyfinName,
  defaultConfig as jellyfinConfig,
} from "@mpv-easy/jellyfin"

const { clipboardPlayEventName } = {
  ...defaultConfig,
  ...getOptions("clipboard-play", {
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
