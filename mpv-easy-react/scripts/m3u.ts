import "@mpv-easy/polyfill"
import { getOptions } from "@mpv-easy/tool"
import { defaultConfig, m3u } from "@mpv-easy/m3u"

const config = {
  ...defaultConfig,
  ...getOptions("mpv-easy-m3u", {
    enabled: {
      type: "boolean",
      key: "enabled",
    },
    priority: {
      type: "number",
      key: "priority",
    },
  }),
}

m3u(config)
