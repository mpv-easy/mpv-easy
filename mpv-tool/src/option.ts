import { Argb } from "e-color"
import { readOptions, readFile, getMpvScriptOptsDir, joinPath } from "./mpv"
import { existsSync } from "./fs"
import { Simplify, Writable } from "type-fest"

export type OptionType = "number" | "string" | "boolean" | "color" | "json"

export type OptionItem<T extends OptionType, D = InferType<T>> = {
  type: T
  key?: string
  default?: D
}

export type OptionConfig = Record<string, OptionItem<OptionType>>

type OptionTypeMap = {
  number: number
  string: string
  color: string
  boolean: boolean
  json: unknown
}

type InferType<T extends OptionType> = OptionTypeMap[T]

/** Infer the value type from an OptionItem: use default's type if present, otherwise the type map */
type InferValue<I extends OptionItem<OptionType>> = I extends {
  default: infer D
}
  ? D
  : InferType<I["type"]>

/** Split config into required (has default) and optional (no default) fields */
type RequiredKeys<T extends OptionConfig> = {
  [K in keyof T]: T[K] extends { default: any } ? K : never
}[keyof T]

type OptionalKeys<T extends OptionConfig> = {
  [K in keyof T]: T[K] extends { default: any } ? never : K
}[keyof T]

type RenameKey<
  T extends OptionConfig,
  K extends keyof T,
> = T[K]["key"] extends string ? T[K]["key"] : K

type InferredOptions<T extends OptionConfig> = Simplify<
  Writable<
    {
      [K in RequiredKeys<T> as RenameKey<T, K>]: InferValue<T[K]>
    } & {
      [K in OptionalKeys<T> as RenameKey<T, K>]?: InferValue<T[K]>
    }
  >
>

/**
 * Resolve a JSON file path with fallback strategy:
 * 1. If the path exists as-is, use it directly
 * 2. If it's a bare filename (no dir separators), look in script-opts/
 * 3. Otherwise return undefined
 */
function resolveJsonPath(path: string): string | undefined {
  if (existsSync(path)) return path

  const hasSeparator = path.includes("/") || path.includes("\\")
  if (!hasSeparator) {
    const fallback = joinPath(getMpvScriptOptsDir(), path)
    if (existsSync(fallback)) return fallback
  }

  return undefined
}

export function getOptions<
  const T extends OptionConfig,
  R = InferredOptions<T>,
>(
  id: string,
  config: T,
  update?: (changelist: Record<keyof R, boolean | undefined>) => void,
): R {
  const rawOption: Record<string, string> = {}
  for (const i in config) {
    rawOption[i] = ""
  }
  readOptions(rawOption, id, update as any)

  const ret: any = {}
  for (const k in rawOption) {
    const key = config[k].key || k
    let v = rawOption[k].trim()
    if (
      (v.startsWith(`"`) && v.endsWith('"')) ||
      (v.startsWith(`'`) && v.endsWith(`'`))
    ) {
      v = v.slice(1, -1)
    }
    if (v.length) {
      switch (config[k].type) {
        case "number": {
          ret[key] = +v
          break
        }
        case "string": {
          ret[key] = v
          break
        }
        case "boolean": {
          ret[key] = v === "yes"
          break
        }
        case "color": {
          const bgra = new Argb(v.length === 7 ? v : `#FF${v.slice(1)}`, true)
            .toBgra()
            .toHex("#")
          ret[key] = bgra
          break
        }
        case "json": {
          const resolved = resolveJsonPath(v)
          if (resolved) {
            try {
              ret[key] = JSON.parse(readFile(resolved))
            } catch {
              ret[key] = undefined
            }
          }
          break
        }
      }
    } else {
      if (config[k].default !== undefined) ret[key] = config[k].default
    }
  }
  return ret
}

/**
 * Read a single mpv option that points to a JSON file, parse it, and return as T.
 *
 * Path resolution strategy:
 * 1. If the value is an absolute/relative path that exists, use it directly
 * 2. If it's a bare filename (e.g. "mount.json"), look in portable_config/script-opts/
 *
 * Usage in mpv.conf:
 *   mpv-easy-id-key=c:/path/to/data.json
 *   mpv-easy-id-key=mount.json
 *
 * @param id - The mpv option identifier (e.g. "mpv-easy-sponsorblock")
 * @param key - The option key (e.g. "data")
 * @returns Parsed JSON as T, or undefined if file not found or parse error
 */
export function getOptionJSON<T = unknown>(
  id: string,
  key: string,
): T | undefined {
  const raw: Record<string, string> = { [key]: "" }
  readOptions(raw, id)
  let path = raw[key]?.trim()
  if (!path) return undefined

  if (
    (path.startsWith(`"`) && path.endsWith('"')) ||
    (path.startsWith(`'`) && path.endsWith(`'`))
  ) {
    path = path.slice(1, -1)
  }

  const resolved = resolveJsonPath(path)
  if (!resolved) return undefined

  try {
    return JSON.parse(readFile(resolved)) as T
  } catch {
    return undefined
  }
}
