import {
  command,
  getScriptConfigDir,
  joinPath,
  osdMessage,
  registerScriptMessage,
  setClipboardImage,
} from "@mpv-easy/tool"

import { definePlugin } from "@mpv-easy/plugin"

export const pluginName = "@mpv-easy/copy-screen"

export type copyScreenConfig = {
  eventName: string
  path: string
}

export const defaultConfig: copyScreenConfig = {
  eventName: "copy-screen",
  path: joinPath(getScriptConfigDir(), "mpv-easy-copy-screen.tmp.png"),
}

async function copyScreen(path: string) {
  command(`no-osd screenshot-to-file ${path}`)
  const result = await setClipboardImage(path)
  if (result) {
    osdMessage("Copied to Clipboard", 5)
  } else {
    osdMessage("Failed to copy screen to clipboard", 5)
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
    const key = context[pluginName]?.eventName ?? defaultConfig.eventName
    const path = context[pluginName]?.path ?? defaultConfig.path
    registerScriptMessage(key, () => {
      copyScreen(path)
    })
  },
  destroy: () => {
    // removeKeyBinding(pluginName)
  },
}))
