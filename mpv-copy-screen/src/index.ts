import {
  addKeyBinding,
  command,
  getScriptConfigDir,
  joinPath,
  osdMessage,
  setClipboardImage,
} from "@mpv-easy/tool"

import { definePlugin } from "@mpv-easy/plugin"

export const pluginName = "@mpv-easy/copy-screen"

export type copyTimeConfig = {
  key: string
  path: string
}

export const defaultConfig: copyTimeConfig = {
  key: "ctrl+c",
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
    [pluginName]: copyTimeConfig
  }
}

export default definePlugin((context) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {
    const key = context[pluginName]?.key ?? defaultConfig.key
    const path = context[pluginName]?.path ?? defaultConfig.path
    addKeyBinding(key, pluginName, () => {
      copyScreen(path)
    })
  },
  destroy: () => {
    // removeKeyBinding(pluginName)
  },
}))
