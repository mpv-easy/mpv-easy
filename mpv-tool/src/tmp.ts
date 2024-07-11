import { getenv } from "./mpv"

export function getTmpDir() {
  return getenv("TMPDIR") || getenv("TMP") || getenv("tmp") || "./"
}
