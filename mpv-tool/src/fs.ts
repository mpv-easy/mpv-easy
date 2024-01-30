import { fileInfo } from "./mpv"

export function existsSync(path: string): boolean {
  return !!fileInfo(path)
}
