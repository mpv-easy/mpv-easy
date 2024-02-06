import { fileInfo } from "./mpv"
import { normalize } from "./path"

export function existsSync(path: string): boolean {
  return !!fileInfo(path)
}

export function isDir(path: string): boolean {
  return !!fileInfo(path)?.is_dir
}
export function getFileName(path: string) {
  return normalize(path).split("/").at(-1)!
}

export function dir(path: string | undefined): string | undefined {
  if (!path?.length) {
    return undefined
  }

  const d = path.split("/").slice(0, -1).join("/")
  if (isDir(d)) {
    return d
  }
  return undefined
}
