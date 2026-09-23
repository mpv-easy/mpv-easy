import {
  type File as ArchiveFile,
  decode,
  guess,
} from "@easy-install/easy-archive"
import type { Script } from "@mpv-easy/mpsm"

/**
 * A script package dropped onto the page.
 *
 * Local packages are kept in memory only: they are not persisted, not
 * shareable and never uploaded anywhere. They exist so a package can be
 * tested end-to-end without publishing it first.
 */
export interface LocalPackage {
  script: Script
  /** Original dropped file name, used to guess the archive format. */
  fileName: string
  /** Raw archive bytes, re-decoded on each use to avoid mutating entries. */
  bytes: Uint8Array
}

const packages = new Map<string, LocalPackage>()

export function getLocalPackage(name: string): LocalPackage | undefined {
  return packages.get(name)
}

export function getLocalPackages(): LocalPackage[] {
  return [...packages.values()]
}

export function addLocalPackage(pkg: LocalPackage): void {
  packages.set(pkg.script.name, pkg)
}

export function removeLocalPackage(name: string): void {
  packages.delete(name)
}

export function clearLocalPackages(): void {
  packages.clear()
}

export function isArchive(name: string): boolean {
  return guess(name) !== undefined
}

/**
 * Whether the decoded archive contains an mpv script entry.
 * Accepts `.js` or `.lua` files at the root or nested (e.g. `scripts/`).
 */
export function hasScriptFile(files: ArchiveFile[]): boolean {
  return files.some((i) => {
    if (i.isDir) return false
    const p = i.path.toLowerCase()
    return p.endsWith(".js") || p.endsWith(".lua")
  })
}

export function hasExternals(files: ArchiveFile[]): boolean {
  return files.some((i) => {
    if (i.isDir) return false
    const p = i.path.toLowerCase()
    return p.startsWith("externals/")
  })
}

/**
 * Decode a dropped archive into archive entries.
 * Returns undefined when the format is unsupported or decoding fails.
 */
export function decodeArchive(
  name: string,
  bytes: Uint8Array,
): ArchiveFile[] | undefined {
  const fmt = guess(name)
  if (fmt === undefined) {
    return undefined
  }
  try {
    const files = decode(fmt, bytes)
    return files?.length ? files : undefined
  } catch (e) {
    console.error("decodeArchive failed", name, e)
    return undefined
  }
}

const decoder = new TextDecoder("utf-8")

/**
 * Read `script.json` metadata from decoded archive entries.
 * Accepts the file at the archive root or inside a single wrapper folder.
 */
export function readScriptJson(files: ArchiveFile[]): Script | undefined {
  const candidates = files.filter(
    (i) => !i.isDir && i.path.split("/").at(-1) === "script.json",
  )
  if (!candidates.length) {
    return undefined
  }
  // Prefer the shallowest script.json (root before nested wrappers).
  const file = candidates.reduce((a, b) =>
    a.path.split("/").length <= b.path.split("/").length ? a : b,
  )
  try {
    const meta = JSON.parse(decoder.decode(file.clone().buffer))
    if (!meta || typeof meta.name !== "string" || !meta.name) {
      return undefined
    }
    return meta as Script
  } catch (e) {
    console.error("readScriptJson failed", e)
    return undefined
  }
}
