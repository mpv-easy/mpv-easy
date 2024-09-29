// biome-ignore lint/suspicious/useNamespaceKeyword: <explanation>
declare module globalThis {
  // biome-ignore lint/style/noVar: <explanation>
  var version: string
}

const version = globalThis.version ?? (+Date.now()).toString()

import "@mpv-easy/tool"
import clipPlayPlugin, {
  defaultConfig as clipPlayConfig,
  pluginName as clipPlayName,
} from "@mpv-easy/clip-play"

import easyPlugin, {
  defaultConfig as easyConfig,
  pluginName as easyName,
} from "./main"

import anime4kPlugin, {
  defaultConfig as anime4kConfig,
  pluginName as anime4kName,
} from "@mpv-easy/anime4k"

import copyTimePlugin, {
  defaultConfig as copyTimeConfig,
  pluginName as copyTimeName,
} from "@mpv-easy/copy-time"
import copyScreenPlugin, {
  defaultConfig as copyScreenConfig,
  pluginName as copyScreenName,
} from "@mpv-easy/copy-screen"

import i18nPlugin, {
  defaultConfig as i18nConfig,
  pluginName as i18nName,
} from "@mpv-easy/i18n"

import thumbfastPlugin, {
  defaultConfig as thumbfastConfig,
  pluginName as thumbfastName,
} from "@mpv-easy/thumbfast"

import autoloadPlugin, {
  defaultConfig as autoloadConfig,
  pluginName as autoloadName,
} from "@mpv-easy/autoload"
import jellyfinPlugin, {
  defaultConfig as jellyfinConfig,
  pluginName as jellyfinName,
} from "@mpv-easy/jellyfin"

import translatePlugin, {
  defaultConfig as translateConfig,
  pluginName as translateName,
} from "@mpv-easy/translate"

import { type PluginContext, SystemApi } from "@mpv-easy/plugin"
import {
  ConfigDir,
  existsSync,
  getOs,
  getScriptDir,
  joinPath,
  mkdir,
  print,
  readFile,
  writeFile,
} from "@mpv-easy/tool"

export type Experimental = {
  mouseHoverStyle: boolean
  toolbar: boolean
}

export const plugins = [
  clipPlayPlugin,
  anime4kPlugin,
  copyTimePlugin,
  i18nPlugin,
  easyPlugin,
  autoloadPlugin,
  thumbfastPlugin,
  copyScreenPlugin,
  jellyfinPlugin,
  translatePlugin,
]

export interface EnablePlugin {
  [clipPlayName]: boolean
  [anime4kName]: boolean
  [copyTimeName]: boolean
  [i18nName]: boolean
  [easyName]: boolean
  [autoloadName]: boolean
  [thumbfastName]: boolean
  [copyScreenName]: boolean
  [jellyfinName]: boolean
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    enablePlugins: EnablePlugin
    version: string
    experimental: Experimental
  }

  interface SystemApi {
    saveConfig: (config: PluginContext) => void
  }
}

const fileName = "mpv-easy.config.json"
const configDir = joinPath(getScriptDir(), ConfigDir)
const configPath = joinPath(configDir, fileName)

const experimental: Experimental = {
  mouseHoverStyle: false,
  toolbar: true,
}

export function createDefaultContext() {
  return structuredClone({
    [clipPlayName]: clipPlayConfig,
    [anime4kName]: anime4kConfig,
    [copyTimeName]: copyTimeConfig,
    [i18nName]: i18nConfig,
    [easyName]: easyConfig,
    [autoloadName]: autoloadConfig,
    [thumbfastName]: thumbfastConfig,
    [copyScreenName]: copyScreenConfig,
    [jellyfinName]: jellyfinConfig,
    [translateName]: translateConfig,
    enablePlugins: {
      [i18nName]: true,
      [easyName]: true,
      [clipPlayName]: getOs() === "windows",
      [anime4kName]: true,
      [copyTimeName]: false,
      [autoloadName]: true,
      [thumbfastName]: true,
      [copyScreenName]: false,
      [jellyfinName]: true,
      [translateName]: true,
    },
    version,
    experimental,
  })
}

export const defaultContext: PluginContext = createDefaultContext()

export function saveConfig(c: PluginContext) {
  if (!existsSync(configDir)) {
    try {
      mkdir(configDir)
    } catch {
      print(`mkdir config dir error: ${configDir}`)
    }
  }

  try {
    writeFile(configPath, JSON.stringify(c, null, 2))
  } catch {
    print(`write config file error: ${configPath}`)
  }
}

function readConfig(): PluginContext {
  try {
    return JSON.parse(readFile(configPath))
  } catch {
    print(`parse or read config file error: ${configPath}`)
  }
  return defaultContext
}

export function getConfig() {
  let customConfig: PluginContext
  if (existsSync(configPath)) {
    customConfig = readConfig()
    if (customConfig.version !== version) {
      customConfig = defaultContext
      saveConfig(defaultContext)
      print("config version error: fallback to default config")
    }
  } else {
    saveConfig(defaultContext)
    customConfig = defaultContext
  }

  return customConfig
}
