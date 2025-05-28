import "@mpv-easy/polyfill"
import { anime4k, defaultConfig } from "@mpv-easy/anime4k"
import { Shaders } from "@mpv-easy/anime4k/shaders"
import {
  clone,
  existsSync,
  getOptions,
  getTmpDir,
  joinPath,
  mkdir,
  writeFile,
} from "@mpv-easy/tool"
const { current, osdDuration } = {
  ...defaultConfig,
  ...getOptions("mpv-easy-cut", {
    current: {
      type: "number",
      key: "current",
    },
    "osd-duration": {
      type: "number",
      key: "osdDuration",
    },
  }),
}

const shaderDir = joinPath(getTmpDir(), "__anime4k__")

function createShadersDir() {
  if (!existsSync(shaderDir)) {
    mkdir(shaderDir)
  }
  for (const [name, value] of Object.entries(Shaders)) {
    const p = joinPath(shaderDir, `${name}.glsl`)
    writeFile(p, value)
  }
}

function getCustomCOnfig() {
  const config = clone(defaultConfig)

  for (const shader of config.shaders) {
    shader.value = shader.value
      .split(";")
      .map((i) => {
        const name = i.split("/").at(-1)?.split(".")?.[0]
        if (!name) {
          // clear
          return ""
        }
        const p = joinPath(shaderDir, `${name}.glsl`)
        return p
      })
      .join(";")
  }

  config.current = current
  config.osdDuration = osdDuration
  return config
}

createShadersDir()
const config = getCustomCOnfig()
anime4k(config)
