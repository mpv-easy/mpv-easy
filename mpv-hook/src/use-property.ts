import {
  MpvType,
  observeProperty,
  setProperty,
  setPropertyBool,
  setPropertyNative,
  setPropertyNumber,
} from "@mpv-easy/tool"
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

function useProp<T>(name: string, type: keyof MpvType, defaultValue: T) {
  const [prop, setProp] = useState(defaultValue)

  observeProperty(name, type, (_, value) => {
    setProp(value)
  })

  return [
    prop,
    (fn: T | ((oldValue: T) => T)) => {
      // TODO: https://github.com/microsoft/TypeScript/issues/37663#issuecomment-1827885694
      // @ts-ignore
      const v = typeof fn === "function" ? fn(prop) : fn
      setProp(v)
      setMpvProp(name, type, v)
    },
  ] as const
}

export function useProperty<T>(name: string, defaultValue: T) {
  return useProp<T>(name, "native", defaultValue)
}

export function usePropertyBool(name: string, defaultValue: boolean) {
  return useProp<boolean>(name, "bool", defaultValue)
}
export function usePropertyNumber(name: string, defaultValue: number) {
  return useProp<number>(name, "number", defaultValue)
}
export function usePropertyString(name: string, defaultValue: string) {
  return useProp<string>(name, "string", defaultValue)
}
