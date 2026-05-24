import "@mpv-easy/polyfill"
import {
  getOptions,
  registerScriptMessage,
  updatePlaylist,
  showNotification,
} from "@mpv-easy/tool"
import { resolveMountPlaylist, type Mount } from "@mpv-easy/mount"

const config = getOptions("mpv-easy-mount", {
  mount: {
    type: "json",
    key: "mount",
    default: [] as Mount[],
  },
  mountEventName: {
    type: "string",
    key: "mountEventName",
    default: "mount",
  },
  image: {
    type: "boolean",
    key: "image",
    default: true,
  },
  video: {
    type: "boolean",
    key: "video",
    default: true,
  },
  audio: {
    type: "boolean",
    key: "audio",
    default: true,
  },
  maxSize: {
    type: "number",
    key: "maxSize",
    default: 32,
  },
})

const { mount: mounts, mountEventName = "mount", ...autoloadConfig } = config

for (let i = 0; i <= 9; i++) {
  registerScriptMessage(`${mountEventName} ${i}`, async () => {
    const m = mounts[i]
    if (!m) {
      showNotification(`[mount] no mount point at index ${i}`)
      return
    }

    try {
      const list = await resolveMountPlaylist(m, autoloadConfig)
      if (list.length > 0) {
        updatePlaylist(list, 0)
      } else {
        showNotification(`[mount] no playable files found: ${m.name}`)
      }
    } catch {
      showNotification(`[mount] error: ${m.name} ${m.url}`)
    }
  })
}
