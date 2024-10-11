import { Argb } from "e-color"
import { readOptions } from "./mpv"
import { Simplify, Writable } from "type-fest"

export type OptionType = "number" | "string" | "boolean" | "color"

export type OptionItem<T extends OptionType> = {
  type: T
  key?: string
  default?: InferType<T>
}

export type OptionConfig = Record<string, OptionItem<OptionType>>

type OptionTypeMap = {
  number: number
  string: string
  color: string
  boolean: boolean
}

type InferType<T extends OptionType> = OptionTypeMap[T]

type InferredOptions<T extends OptionConfig> = {
  [K in keyof T as T[K]["key"] extends string
    ? T[K]["key"]
    : K]: T[K] extends OptionItem<infer U>
    ? T[K]["key"] extends string
      ? InferType<U>
      : InferType<U>
    : never
}

export function getOptions<
  const T extends OptionConfig,
  R = Simplify<Writable<Partial<InferredOptions<T>>>>,
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
      }
    } else {
      if (config[k].default !== undefined) ret[key] = config[k].default
    }
  }
  return ret
}
