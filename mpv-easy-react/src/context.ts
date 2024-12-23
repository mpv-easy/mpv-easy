declare namespace globalThis {
  // biome-ignore lint/style/noVar: <explanation>
  var version: string
}

const version = globalThis.version ?? Date.now().toString()

import clipboardPlayPlugin, {
  defaultConfig as clipboardPlayConfig,
  pluginName as clipboardPlayName,
} from "@mpv-easy/clipboard-play"

import easyPlugin from "./main"

import { defaultConfig as easyConfig, pluginName as easyName } from "./const"

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

import cutPlugin, {
  defaultConfig as cutConfig,
  pluginName as cutName,
} from "@mpv-easy/cut"

import cropPlugin, {
  defaultConfig as cropConfig,
  pluginName as cropName,
} from "@mpv-easy/crop"

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
import { cloneDeep } from "lodash-es"

export type Experimental = {
  mouseHoverStyle: boolean
  toolbar: boolean
}

export const getPlugins = () => [
  clipboardPlayPlugin,
  anime4kPlugin,
  copyTimePlugin,
  i18nPlugin,
  easyPlugin,
  autoloadPlugin,
  thumbfastPlugin,
  copyScreenPlugin,
  jellyfinPlugin,
  translatePlugin,
  cutPlugin,
  cropPlugin,
]

export interface EnablePlugin {
  [clipboardPlayName]: boolean
  [anime4kName]: boolean
  [copyTimeName]: boolean
  [i18nName]: boolean
  [easyName]: boolean
  [autoloadName]: boolean
  [thumbfastName]: boolean
  [copyScreenName]: boolean
  [jellyfinName]: boolean
  [cutName]: boolean
  [cropName]: boolean
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
  const isWin = getOs() === "windows"
  return cloneDeep({
    renderConfig: {},
    [clipboardPlayName]: clipboardPlayConfig,
    [anime4kName]: anime4kConfig,
    [copyTimeName]: copyTimeConfig,
    [i18nName]: i18nConfig,
    [easyName]: easyConfig,
    [autoloadName]: autoloadConfig,
    [thumbfastName]: thumbfastConfig,
    [copyScreenName]: copyScreenConfig,
    [jellyfinName]: jellyfinConfig,
    [translateName]: translateConfig,
    [cutName]: cutConfig,
    [cropName]: cropConfig,
    enablePlugins: {
      [i18nName]: true,
      [easyName]: true,
      [clipboardPlayName]: isWin,
      [anime4kName]: true,
      [copyTimeName]: true,
      [autoloadName]: true,
      [thumbfastName]: true,
      [copyScreenName]: isWin,
      [jellyfinName]: true,
      [translateName]: true,
      [cutName]: true,
      [cropName]: true,
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
