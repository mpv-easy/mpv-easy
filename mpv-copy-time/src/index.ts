import {
  getPropertyNumber,
  showNotification,
  registerScriptMessage,
  removeKeyBinding,
  setClipboard,
} from "@mpv-easy/tool"

import { definePlugin } from "@mpv-easy/plugin"
export const pluginName = "@mpv-easy/copy-time"

export const defaultConfig: copyTimeConfig = {
  copyTimeEventName: "copy-time",
}

function divmod(a: number, b: number) {
  return [a / b, a % b] as const
}

export async function copyTime() {
  const time_pos = getPropertyNumber("time-pos") || 0
  const [minutes, remainder] = divmod(time_pos, 60)
  const [hours, mins] = divmod(minutes, 60)
  const seconds = Math.floor(remainder)
  const milliseconds = Math.floor((remainder - seconds) * 1000)
  const time = `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
    .toString()
    .padStart(3, "0")}`

  if (await setClipboard(time)) {
    showNotification("Copied to Clipboard")
  } else {
    showNotification("Failed to copy time to clipboard")
  }
}

export type copyTimeConfig = {
  copyTimeEventName: string
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: copyTimeConfig
  }
}

export default definePlugin((context) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {
    const key =
      context[pluginName]?.copyTimeEventName ?? defaultConfig.copyTimeEventName
    registerScriptMessage(key, copyTime)
  },
  destroy: () => {
    removeKeyBinding(pluginName)
  },
}))
