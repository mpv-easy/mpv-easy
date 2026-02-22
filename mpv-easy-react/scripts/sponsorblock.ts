import "@mpv-easy/polyfill"
import { getOptions } from "@mpv-easy/tool"
import { defaultConfig, sponsorblock } from "@mpv-easy/sponsorblock"
const config = {
  ...defaultConfig,
  ...getOptions("mpv-easy-sponsorblock", {
    servers: {
      type: "string",
      key: "servers",
    },
    categories: {
      type: "string",
      key: "categories",
    },
    "sponsorblock-event-name": {
      type: "string",
      key: "sponsorblockEventName",
    },
    "cache-ttl": {
      type: "number",
      key: "cacheTtl",
    },
  }),
}

sponsorblock(config)
