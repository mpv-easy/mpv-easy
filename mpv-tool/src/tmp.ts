import { randomId } from "./math"
import { getenv, joinPath } from "./mpv"

export function getTmpDir() {
  return getenv("TMPDIR") || getenv("TMP") || getenv("tmp") || "."
}

export function getTmpPath(ext?: string) {
  const id = randomId()
  const name = ext ? `${id}.${ext}` : id
  return joinPath(getTmpDir(), name)
}
