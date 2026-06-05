import { getScriptDir, getMpvExeDir } from "../mpv"
import { findByPrefix } from "../fs"

export const defaultBinDirName = "mpv-easy-ext"

let _extPathCache: string | undefined

/** Detect the mpv-easy-ext binary via prefix search (cached) */
export function detectExt(): string {
  if (_extPathCache) return _extPathCache

  _extPathCache =
    findByPrefix(getScriptDir(), "mpv-easy-ext") ??
    findByPrefix(getMpvExeDir(), "mpv-easy-ext")

  if (!_extPathCache) {
    throw new Error(
      `mpv-easy-ext binary not found in:
  - ${getScriptDir()}
  - ${getMpvExeDir()}`,
    )
  }
  return _extPathCache
}
