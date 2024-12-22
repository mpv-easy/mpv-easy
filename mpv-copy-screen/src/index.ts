import {
  joinPath,
  showNotification,
  registerScriptMessage,
  screenshotToFile,
  setClipboardImage,
  getTmpDir,
  randomId,
} from "@mpv-easy/tool"
import { definePlugin } from "@mpv-easy/plugin"
export const pluginName = "@mpv-easy/copy-screen"

export type copyScreenConfig = {
  copyScreenEventName: string
  format: string
}

export const defaultConfig: copyScreenConfig = {
  copyScreenEventName: "copy-screen",
  format: "webp",
}

export async function copyScreen(format: string) {
  const path = joinPath(getTmpDir(), `${randomId()}.${format}`)
  screenshotToFile(path)
  const result = await setClipboardImage(path)
  if (result) {
    showNotification("Copied to Clipboard", 5)
  } else {
    showNotification("Failed to copy screen to clipboard", 5)
  }
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: copyScreenConfig
  }
}

export default definePlugin((context) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {
    const key =
      context[pluginName]?.copyScreenEventName ??
      defaultConfig.copyScreenEventName
    const format = context[pluginName]?.format ?? defaultConfig.format
    registerScriptMessage(key, () => {
      copyScreen(format)
    })
  },
  destroy: () => {
    // removeKeyBinding(pluginName)
  },
}))
