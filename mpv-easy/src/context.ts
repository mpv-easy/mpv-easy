import { version } from "../../package.json"

// ONLY DEV
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
import { cloneDeep } from "lodash-es"

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
  thumbfastPlugin,
  copyScreenPlugin,
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
  return cloneDeep({
    [clipPlayName]: clipPlayConfig,
    [anime4kName]: anime4kConfig,
    [copyTimeName]: copyTimeConfig,
    [i18nName]: i18nConfig,
    [easyName]: easyConfig,
    [autoloadName]: autoloadConfig,
    [thumbfastName]: thumbfastConfig,
    [copyScreenName]: copyScreenConfig,
    enablePlugins: {
      [i18nName]: true,
      [easyName]: true,
      [clipPlayName]: false,
      [anime4kName]: false,
      [copyTimeName]: false,
      [autoloadName]: true,
      [thumbfastName]: false,
      [copyScreenName]: false,
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
