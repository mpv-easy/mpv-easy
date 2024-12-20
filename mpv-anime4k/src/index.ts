import { definePlugin } from "@mpv-easy/plugin"
import {
  command,
  commandv,
  osdMessage,
  registerScriptMessage,
  removeKeyBinding,
} from "@mpv-easy/tool"

export const pluginName = "@mpv-easy/anime4k"

export type ShaderItem = {
  eventName: string
  value: string
  title: string
}

export type Anime4kConfig = {
  current: number
  osdDuration: number
  shaders: ShaderItem[]
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: Anime4kConfig
  }
}

export const defaultConfig: Anime4kConfig = {
  current: 0,
  osdDuration: 2,
  shaders: [
    // https://github.com/bloc97/Anime4K/blob/master/md/GLSL_Instructions_Windows_MPV.md
    // https://github.com/bloc97/Anime4K/blob/master/md/Template/GLSL_Windows_High-end/input.conf
    {
      eventName: "Anime4K-Clear",
      value: "",
      title: "Anime4K: Clear",
    },
    {
      eventName: "Anime4K-A-HQ",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Restore_CNN_VL.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode A (HQ)",
    },
    {
      eventName: "Anime4K-B-HQ",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Restore_CNN_Soft_VL.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode B (HQ)",
    },
    {
      eventName: "Anime4K-C-HQ",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Upscale_Denoise_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode C (HQ)",
    },
    {
      eventName: "Anime4K-AA-HQ",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Restore_CNN_VL.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_VL.glsl;~~/shaders/Anime4K_Restore_CNN_M.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode A+A (HQ)",
    },
    {
      eventName: "Anime4K-BB-HQ",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Restore_CNN_Soft_VL.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Restore_CNN_Soft_M.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode B+B (HQ)",
    },
    {
      eventName: "Anime4K-CA-HQ",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Upscale_Denoise_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Restore_CNN_M.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode C+A (HQ)",
    },
  ],
}

export function toggle(s: string) {
  const cmd = s
    .split(";")
    .filter((i) => !!i.length)
    .map((i) => ["no-osd", "change-list", "glsl-shaders", "toggle", i])
  if (cmd.length) {
    for (const i of cmd) {
      commandv(...i)
    }
  } else {
    clearShader()
  }
}
function clearShader() {
  // commandv('no-osd', 'change-list', 'glsl-shaders', 'clr', "''")
  command(`no-osd change-list glsl-shaders clr ''`)
}
export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    const config = context[pluginName]
    const { value } = config.shaders[config.current]
    if (!config.current) {
      toggle(value)
    } else {
      clearShader()
    }
    for (let i = 0; i < config.shaders.length; i++) {
      const { eventName: key, value, title } = config.shaders[i]
      registerScriptMessage(key, () => {
        if (value.length) {
          toggle(value)
        } else {
          clearShader()
        }
        if (config.osdDuration) {
          osdMessage(title, config.osdDuration)
        }
        config.current = i
        api.saveConfig(context)
      })
    }
  },
  destroy() {
    for (const { eventName: key } of context[pluginName].shaders) {
      removeKeyBinding(`${pluginName}/${key}`)
    }
  },
}))
