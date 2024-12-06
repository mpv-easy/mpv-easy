import { type SystemApi, definePlugin } from "@mpv-easy/plugin"
import type { PluginContext } from "@mpv-easy/plugin"
import { dirname, existsSync, getFileName } from "@mpv-easy/tool"

export const pluginName = "@mpv-easy/cut"

export const defaultConfig: CutConfig = {
  cutEventName: "cut",
  outputEventName: "output",
  cancelEventName: "cancel",
  outputDirectory: "",
}

export type CutConfig = {
  cutEventName: string
  outputEventName: string
  cancelEventName: string
  outputDirectory: string
}

declare module "@mpv-easy/plugin" {
  interface PluginContext {
    [pluginName]: CutConfig
  }
}

export function getArea(points: number[]) {
  if (points.length !== 2) {
    return undefined
  }
  return [...points].sort() as [number, number]
}

export function appendPoint(points: number[], n: number): number[] {
  const newPoints = [...points, n]
  while (newPoints.length > 2) {
    newPoints.shift()
  }
  return newPoints
}

export function getCutVideoPath(
  videoPath: string,
  area: [number, number],
  outputDirectory: string,
): string {
  const dir = existsSync(outputDirectory) ? outputDirectory : dirname(videoPath)
  const name = getFileName(videoPath)!
  const list = name.split(".")

  const prefix = list.slice(0, -1).join(".")
  const ext = list.at(-1)

  const [ss, to] = area.map((i) => i | 0)
  return `${dir}/${prefix}.${ss}.${to}.${ext}`
}

export default definePlugin((context, api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {},
  destroy: () => {},
}))
