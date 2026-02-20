import { execAsync, execSync } from "../common"
import { getRsExtExePath } from "./share"

export type ImageSize = {
  width: number
  height: number
}

function parseDimensions(stdout: string): ImageSize | undefined {
  const trimmed = stdout.trim()
  if (!trimmed) return undefined
  const parts = trimmed.split(" ")
  const width = Number.parseInt(parts[0], 10)
  const height = Number.parseInt(parts[1], 10)
  if (Number.isNaN(width) || Number.isNaN(height)) return undefined
  return { width, height }
}

function buildArgs(
  exe: string,
  input: string,
  output: string,
  width?: number,
  height?: number,
): string[] {
  const args = [exe, "img", input, output]
  if (width != null) args.push("--width", String(width))
  if (height != null) args.push("--height", String(height))
  return args
}

export function convertImage(
  input: string,
  output: string,
  exe = getRsExtExePath(),
  width?: number,
  height?: number,
): ImageSize | undefined {
  const stdout = execSync(buildArgs(exe, input, output, width, height))
  return parseDimensions(stdout)
}

export async function convertImageAsync(
  input: string,
  output: string,
  exe = getRsExtExePath(),
  width?: number,
  height?: number,
): Promise<ImageSize | undefined> {
  const stdout = await execAsync(buildArgs(exe, input, output, width, height))
  return parseDimensions(stdout)
}
