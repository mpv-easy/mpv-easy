import { fileInfo } from "./mpv"

export function existsSync(path: string): boolean {
  return !!fileInfo(path)
}

export function getFileName(path: string) {
  return path.replaceAll("\\\\", "//").replaceAll("\\", "/").split("/").at(-1)!
}
