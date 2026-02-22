declare namespace globalThis {
  var version: string
}

const version = globalThis.version ?? Date.now().toString()

import clipboardPlayPlugin, {
  defaultConfig as clipboardPlayConfig,
  pluginName as clipboardPlayName,
} from "@mpv-easy/clipboard-play"

import easyPlugin from "./main"

import {
  defaultConfig as easyConfig,
  pluginName as easyName,
  pluginName,
} from "./const"

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
import {
  defaultConfig as frameSeekerConfig,
  pluginName as frameSeekerName,
} from "@mpv-easy/frame-seeker"
import {
  defaultConfig as youtubeConfig,
  pluginName as youtubeName,
} from "@mpv-easy/youtube"
import sponsorblockPlugin, {
  defaultConfig as sponsorblockConfig,
  pluginName as sponsorblockName,
} from "@mpv-easy/sponsorblock"

import { type PluginContext } from "@mpv-easy/plugin"
import {
  clone,
  ConfigDir,
  existsSync,
  getDisplayResolutionType,
  getOs,
  getScriptDir,
  joinPath,
  mkdir,
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
  sponsorblockPlugin,
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
  [frameSeekerName]: boolean
  [sponsorblockName]: boolean
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
    [frameSeekerName]: frameSeekerConfig,
    [youtubeName]: youtubeConfig,
    [sponsorblockName]: sponsorblockConfig,
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
      [frameSeekerName]: true,
      [youtubeName]: false,
      [sponsorblockName]: true,
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
    customConfig = clone(defaultContext)
    const type = getDisplayResolutionType()
    let scale = 1
    switch (type) {
      case "4K": {
        break
      }
      case "2K": {
        scale = 0.75
        break
      }
      case "1080P": {
        scale = 0.5
        break
      }
      case "720P": {
        scale = 0.5
        break
      }
    }
    customConfig[pluginName].style.dark.fontSizeScale = scale
    customConfig[pluginName].style.light.fontSizeScale = scale
    saveConfig(customConfig)
  }

  return customConfig
}
