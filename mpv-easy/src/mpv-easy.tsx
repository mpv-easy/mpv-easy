import "@mpv-easy/tool"
import clipPlayPlugin, {
  defaultConfig as clipPlayConfig,
  pluginName as clipPlayName,
} from "@mpv-easy/clip-play"

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

import easyPlugin, {
  defaultConfig as easyConfig,
  pluginName as easyName,
} from "./main"
import { PluginContext, SystemApi } from "@mpv-easy/plugin"
import {
  ConfigDir,
  existsSync,
  getScriptDir,
  joinPath,
  mkdir,
  readFile,
  writeFile,
} from "@mpv-easy/tool"

import { version } from "../package.json"

// const version = Date.now().toString()

export type Experimental = {
  mouseHoverStyle: boolean
  toolbar: boolean
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

const plugins = [
  clipPlayPlugin,
  anime4kPlugin,
  copyTimePlugin,
  i18nPlugin,
  easyPlugin,
  autoloadPlugin,
  thumbfastPlugin,
]

interface EnablePlugin {
  [clipPlayName]: boolean
  [anime4kName]: boolean
  [copyTimeName]: boolean
  [i18nName]: boolean
  [easyName]: boolean
  [autoloadName]: boolean
  [thumbfastName]: boolean
}

const fileName = "mpv-easy.config.json"
const configDir = joinPath(getScriptDir(), ConfigDir)
const configPath = joinPath(configDir, fileName)

const experimental: Experimental = {
  mouseHoverStyle: false,
  toolbar: true,
}

const defaultContext: PluginContext = {
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

function saveConfig(c: PluginContext) {
  if (!existsSync(configDir)) {
    try {
      mkdir(configDir)
    } catch {
      console.log("mkdir config dir error: " + configDir)
    }
  }

  try {
    writeFile(configPath, JSON.stringify(c, null, 2))
  } catch {
    console.log("write config file error: " + configPath)
  }
}
const api: SystemApi = {
  saveConfig,
}

function readConfig(): PluginContext {
  try {
    return JSON.parse(readFile(configPath))
  } catch {
    console.log("parse or read config file error: " + configPath)
  }
  return defaultContext
}

let customConfig: PluginContext

if (existsSync(configPath)) {
  customConfig = readConfig()
  if (customConfig.version !== version) {
    customConfig = defaultContext
    saveConfig(defaultContext)
    console.log("config version error: fallback to default config")
  }
} else {
  saveConfig(defaultContext)
  customConfig = defaultContext
}

plugins.forEach((definePlugin) => {
  const plugin = definePlugin(customConfig, api)
  if (
    customConfig.enablePlugins[plugin.name as keyof EnablePlugin] &&
    plugin.create
  ) {
    plugin.create()
    console.log("add plugin ", plugin.name)
  }
})
