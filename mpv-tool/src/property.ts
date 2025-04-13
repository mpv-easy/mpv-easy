import isEq from "lodash-es/isEqual"
import {
  getPropertyBool,
  getPropertyNative,
  getPropertyNumber,
  getPropertyString,
  observeProperty,
  observePropertyBool,
  observePropertyNumber,
  observePropertyString,
  setPropertyBool,
  setPropertyNative,
  setPropertyNumber,
  setPropertyString,
  unobserveProperty,
} from "./mpv"
import { BoolProp, NumberProp, NativeProp, StringProp } from "./type"

export class PropertyNumber {
  constructor(public name: NumberProp | (string & {})) {}

  get value(): number {
    return getPropertyNumber(this.name)!
  }
  set value(v: number) {
    setPropertyNumber(this.name, v)
  }
  set(v: number) {
    this.value = v
    return this
  }
  get() {
    return this.value
  }

  observe(fn: (name: string, value: number) => void) {
    let last: number
    return observePropertyNumber(this.name, (name: string, value: number) => {
      if (last !== value || typeof last === "undefined") {
        fn(name, value)
        last = value
      }
    })
  }
  unobserve(fn: (...args: unknown[]) => void) {
    return unobserveProperty(fn)
  }
}

export class PropertyBool {
  constructor(public name: BoolProp | (string & {})) {}
  get value(): boolean {
    return getPropertyBool(this.name)!
  }
  set value(v: boolean) {
    setPropertyBool(this.name, v)
  }
  set(v: boolean) {
    this.value = v
    return this
  }
  on() {
    return this.set(true)
  }
  off() {
    return this.set(false)
  }
  cycle() {
    return this.set(!this.value)
  }
  get() {
    return this.value
  }

  observe(fn: (name: string, value: boolean) => void) {
    let last: boolean
    return observePropertyBool(this.name, (name, value) => {
      if (last !== value || typeof last === "undefined") {
        fn(name, value)
        last = value
      }
    })
  }
  unobserve(fn: (...args: unknown[]) => void) {
    return unobserveProperty(fn)
  }
}

export class PropertyString {
  constructor(public name: StringProp | (string & {})) {}
  get value(): string {
    return getPropertyString(this.name)!
  }
  set value(v: string) {
    setPropertyString(this.name, v)
  }
  set(v: string) {
    this.value = v
    return this
  }
  get() {
    return this.value
  }

  observe(fn: (name: string, value: string) => void) {
    let last: string
    return observePropertyString(this.name, (name, value) => {
      if (last !== value || typeof last === "undefined") {
        fn(name, value)
        last = value
      }
    })
  }
  unobserve(fn: (...args: unknown[]) => void) {
    return unobserveProperty(fn)
  }
}
export class PropertyNative<K extends keyof NativeProp, T = NativeProp[K]> {
  constructor(public name: K) {}
  get value(): T | undefined {
    return getPropertyNative(this.name)
  }
  set value(v: T) {
    setPropertyNative(this.name, v)
  }

  set(v: T) {
    this.value = v
    return this
  }

  get() {
    return this.value
  }

  observe(fn: (name: string, value: T) => void, isEqual = isEq) {
    let lastValue: T
    return observeProperty(this.name, "native", (name: string, value: T) => {
      if (typeof lastValue === "undefined" || !isEqual(value, lastValue)) {
        lastValue = value
        fn(name, value)
      }
    })
  }

  unobserve(fn: (...args: unknown[]) => void) {
    return unobserveProperty(fn)
  }
}
