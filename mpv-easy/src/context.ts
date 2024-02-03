import { version } from "../../package.json"
// const version = (+Date.now()).toString()

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

import { PluginContext, SystemApi } from "@mpv-easy/plugin"
import {
  ConfigDir,
  existsSync,
  getScriptDir,
  joinPath,
  mkdir,
  print,
  readFile,
  writeFile,
} from "@mpv-easy/tool"
import { Store } from "./store"

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
]

export interface EnablePlugin {
  [clipPlayName]: boolean
  [anime4kName]: boolean
  [copyTimeName]: boolean
  [i18nName]: boolean
  [easyName]: boolean
  [autoloadName]: boolean
  [thumbfastName]: boolean
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

export const defaultContext: PluginContext = {
  [clipPlayName]: clipPlayConfig,
  [anime4kName]: anime4kConfig,
  [copyTimeName]: copyTimeConfig,
  [i18nName]: i18nConfig,
  [easyName]: easyConfig,
  [autoloadName]: autoloadConfig,
  [thumbfastName]: thumbfastConfig,
  enablePlugins: {
    [clipPlayName]: false,
    [anime4kName]: true,
    [copyTimeName]: false,
    [i18nName]: true,
    [easyName]: true,
    [autoloadName]: true,
    [thumbfastName]: false,
  },
  version,
  experimental,
}

export function saveConfig(c: PluginContext) {
  if (!existsSync(configDir)) {
    try {
      mkdir(configDir)
    } catch {
      print("mkdir config dir error: " + configDir)
    }
  }

  try {
    writeFile(configPath, JSON.stringify(c, null, 2))
  } catch {
    print("write config file error: " + configPath)
  }
}

function readConfig(): PluginContext {
  try {
    return JSON.parse(readFile(configPath))
  } catch {
    print("parse or read config file error: " + configPath)
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
