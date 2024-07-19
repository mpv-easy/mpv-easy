import { definePlugin } from "@mpv-easy/plugin"
import {
  addKeyBinding,
  command,
  osdMessage,
  removeKeyBinding,
} from "@mpv-easy/tool"

export const pluginName = "@mpv-easy/anime4k"

export type ShaderItem = {
  key: string
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
    {
      key: "CTRL+0",
      value: "",
      title: "Anime4K: Clear",
    },
    {
      key: "CTRL+1",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Restore_CNN_VL.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_VL.glsl;~~/shaders/Anime4K_Restore_CNN_M.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode A+A (HQ)",
    },
    {
      key: "CTRL+2",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Restore_CNN_Soft_VL.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode B (HQ)",
    },

    {
      key: "CTRL+3",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Upscale_Denoise_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode C (HQ)",
    },
    {
      key: "CTRL+4",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Restore_CNN_VL.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode A (HQ)",
    },
    {
      key: "CTRL+5",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Restore_CNN_Soft_VL.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Restore_CNN_Soft_M.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode B+B (HQ)",
    },
    {
      key: "CTRL+6",
      value:
        "~~/shaders/Anime4K_Clamp_Highlights.glsl;~~/shaders/Anime4K_Upscale_Denoise_CNN_x2_VL.glsl;~~/shaders/Anime4K_AutoDownscalePre_x2.glsl;~~/shaders/Anime4K_AutoDownscalePre_x4.glsl;~~/shaders/Anime4K_Restore_CNN_M.glsl;~~/shaders/Anime4K_Upscale_CNN_x2_M.glsl",
      title: "Anime4K: Mode C+A (HQ)",
    },
  ],
}

export default definePlugin((context, api) => ({
  name: pluginName,
  create() {
    const config = context[pluginName]
    const { value } = config.shaders[config.current]
    if (!config.current) {
      command(`no-osd change-list glsl-shaders toggle "${value}";`)
    } else {
      command(`no-osd change-list glsl-shaders clr "";`)
    }
    for (let i = 0; i < config.shaders.length; i++) {
      const { key, value, title } = config.shaders[i]
      addKeyBinding(key, `${pluginName}/${key}`, () => {
        if (value.length) {
          command(`no-osd change-list glsl-shaders toggle "${value}";`)
        } else {
          command(`no-osd change-list glsl-shaders clr "";`)
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
    for (const { key } of context[pluginName].shaders) {
      removeKeyBinding(`${pluginName}/${key}`)
    }
  },
}))
