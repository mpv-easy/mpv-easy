import { type SystemApi, definePlugin } from "@mpv-easy/plugin"
import type { PluginContext } from "@mpv-easy/plugin"
import {
  existsSync,
  getDesktopDir,
  getFileName,
  getProperty,
  getSafeName,
  isRemote,
  Rect,
} from "@mpv-easy/tool"

export const pluginName = "@mpv-easy/cut"

export const defaultConfig: CutConfig = {
  cutEventName: "cut",
  outputEventName: "output",
  outputGifEventName: "output-gif",
  cancelEventName: "cancel",
  outputDirectory: "",
  fps: 24,
  // https://ffmpeg.org/ffmpeg-scaler.html#toc-Scaler-Options
  flags: "spline",
  maxWidth: 1024,
}

export type CutConfig = {
  cutEventName: string
  outputEventName: string
  outputGifEventName: string
  cancelEventName: string
  outputDirectory: string
  fps: number
  flags: string
  maxWidth: number
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
  return [...points].sort((a, b) => a - b) as [number, number]
}

export function appendPoint(points: number[], n: number): number[] {
  const newPoints = [...points, n]
  while (newPoints.length > 2) {
    newPoints.shift()
  }
  if (newPoints.length === 2 && newPoints[0] === newPoints[1]) {
    newPoints.pop()
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
  const unsafeName = isRemote(videoPath)
    ? getProperty("force-media-title", getFileName(videoPath)!)
    : getFileName(videoPath)!
  const name = getSafeName(unsafeName)
  const list = name.split(".")

  const prefix = list.slice(0, list.length === 1 ? 1 : -1).join(".")
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
