import {
  BoolProp,
  type MpvType,
  NumberProp,
  observeProperty,
  NativeProp,
  setProperty,
  setPropertyBool,
  setPropertyNative,
  setPropertyNumber,
  StringProp,
  getPropertyNumber,
  getProperty,
  getPropertyBool,
  getPropertyNative,
} from "@mpv-easy/tool"
import isEqual from "lodash-es/isEqual"
import { useState } from "react"

const setMpvProp = (name: string, type: keyof MpvType, value: any) => {
  switch (type) {
    case "bool": {
      setPropertyBool(name, value)
      break
    }
    case "string": {
      setProperty(name, value)
      break
    }
    case "number": {
      setPropertyNumber(name, value)
      break
    }
    case "native": {
      setPropertyNative(name, value)
      break
    }
    default: {
      throw new Error(`prop type error: ${name} ${type}`)
    }
  }
}

const getMpvProp = <T>(name: string, type: keyof MpvType): T => {
  switch (type) {
    case "bool": {
      return getPropertyBool(name) as T
    }
    case "string": {
      return getProperty(name) as T
    }
    case "number": {
      return getPropertyNumber(name) as T
    }
    case "native": {
      return getPropertyNative(name) as T
    }
    default: {
      throw new Error(`prop type error: ${name} ${type}`)
    }
  }
}

function useProp<T>(name: string, type: keyof MpvType, defaultValue?: T) {
  const [prop, setProp] = useState<T>(
    typeof defaultValue === "undefined" ? getMpvProp(name, type) : defaultValue,
  )

  observeProperty(name, type, (_, value) => {
    if (!isEqual(prop, value)) setProp(value)
  })

  return [
    prop,
    (fn: T | ((oldValue: T) => T)) => {
      // TODO: https://github.com/microsoft/TypeScript/issues/37663#issuecomment-1827885694
      // @ts-ignore
      const v = typeof fn === "function" ? fn(prop) : fn
      if (prop !== v) {
        setProp(v)
        setMpvProp(name, type, v)
      }
    },
  ] as const
}

export function useProperty<K extends keyof NativeProp, T = NativeProp[K]>(
  name: K,
  defaultValue?: NoInfer<T>,
) {
  return useProp<T>(name, "native", defaultValue)
}

export function usePropertyBool(
  name: BoolProp | (string & {}),
  defaultValue?: boolean,
) {
  return useProp<boolean>(name, "bool", defaultValue)
}
export function usePropertyNumber(
  name: NumberProp | (string & {}),
  defaultValue?: number,
) {
  return useProp<number>(name, "number", defaultValue)
}
export function usePropertyString(
  name: StringProp | (string & {}),
  defaultValue?: string,
) {
  return useProp<string>(name, "string", defaultValue)
}
