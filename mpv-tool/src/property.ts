import { isEqual as isEq } from "lodash-es"
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
  private _lastValue: number | undefined

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
    const callback = (name: string, value: number) => {
      if (this._lastValue !== value || typeof this._lastValue === "undefined") {
        fn(name, value)
        this._lastValue = value
      }
    }
    observePropertyNumber(this.name, callback)
    return callback
  }
  unobserve(fn: (...args: unknown[]) => void) {
    this._lastValue = undefined
    return unobserveProperty(fn)
  }
}

export class PropertyBool {
  constructor(public name: BoolProp | (string & {})) {}
  private _lastValue: boolean | undefined

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
    const callback = (name: string, value: boolean) => {
      if (this._lastValue !== value || typeof this._lastValue === "undefined") {
        fn(name, value)
        this._lastValue = value
      }
    }
    observePropertyBool(this.name, callback)
    return callback
  }
  unobserve(fn: (...args: unknown[]) => void) {
    this._lastValue = undefined
    return unobserveProperty(fn)
  }
}

export class PropertyString {
  constructor(public name: StringProp | (string & {})) {}
  private _lastValue: string | undefined

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
    const callback = (name: string, value: string) => {
      if (this._lastValue !== value || typeof this._lastValue === "undefined") {
        fn(name, value)
        this._lastValue = value
      }
    }
    observePropertyString(this.name, callback)
    return callback
  }
  unobserve(fn: (...args: unknown[]) => void) {
    this._lastValue = undefined
    return unobserveProperty(fn)
  }
}
export class PropertyNative<K extends keyof NativeProp, T = NativeProp[K]> {
  constructor(public name: K) {}
  private _lastValue: T | undefined

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
    const callback = (name: string, value: T) => {
      if (
        typeof this._lastValue === "undefined" ||
        !isEqual(value, this._lastValue)
      ) {
        this._lastValue = value
        fn(name, value)
      }
    }
    observeProperty(this.name, "native", callback)
    return callback
  }

  unobserve(fn: (...args: any[]) => void) {
    this._lastValue = undefined
    return unobserveProperty(fn)
  }
}
