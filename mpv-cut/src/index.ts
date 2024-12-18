import { type SystemApi, definePlugin } from "@mpv-easy/plugin"
import type { PluginContext } from "@mpv-easy/plugin"
import { existsSync, getDesktopDir, getFileName, Rect } from "@mpv-easy/tool"

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

export function getVideoSegment(points: number[]) {
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
  segment: [number, number],
  rect: undefined | Rect,
  outputDirectory: string,
): string {
  const dir = existsSync(outputDirectory) ? outputDirectory : getDesktopDir()
  const name = getFileName(videoPath)!
  const list = name.split(".")

  const prefix = list.slice(0, -1).join(".")
  const ext = list.length > 1 ? list.at(-1)! : "mp4"

  const [ss, to] = segment.map((i) => i | 0)
  const nameList = [prefix, ss, to]
  if (rect) {
    nameList.push(rect.x | 0)
    nameList.push(rect.y | 0)
    nameList.push(rect.width | 0)
    nameList.push(rect.height | 0)
  }

  nameList.push(ext)
  return `${dir}/${nameList.join(".")}`
}

export default definePlugin((context, api) => ({
  name: pluginName,
  defaultConfig: defaultConfig,
  create: () => {},
  destroy: () => {},
}))
