import {
  getPropertyBool,
  getPropertyNative,
  getPropertyNumber,
  getPropertyString,
  observeProperty,
  setPropertyBool,
  setPropertyNative,
  setPropertyNumber,
  setPropertyString,
} from "./mpv"

export type MpvPropertyBoolName = "pause" | (string & {})
export type MpvPropertyNumberName = "osd-width" | (string & {})
export type MpvPropertyStringName = "path" | (string & {})

export type MpvPropertyTypeMap = {
  "osd-dimensions": {
    w: number
    h: number
  }
}

export type MpvPropertyNativeName = "osd" | "osd-dimensions" | (string & {})
export class Property<T> {
  constructor(public name: string) {}
}

export class PropertyNumber {
  constructor(public name: MpvPropertyNumberName) {}

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

  observe(fn: (value: number) => void) {
    let last: number
    observeProperty(this.name, "number", (_, value: number) => {
      if (last !== value || typeof last === "undefined") {
        fn(value)
        last = value
      }
    })
  }
}

export class PropertyBool {
  constructor(public name: MpvPropertyBoolName) {}
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

  observe(fn: (value: boolean) => void) {
    let last: boolean
    observeProperty(this.name, "bool", (_, value) => {
      if (last !== value || typeof last === "undefined") {
        fn(value)
        last = value
      }
    })
  }
}

export class PropertyString {
  constructor(public name: MpvPropertyStringName) {}
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

  observe(fn: (value: string) => void) {
    let last: string
    observeProperty(this.name, "string", (_, value) => {
      if (last !== value || typeof last === "undefined") {
        fn(value)
        last = value
      }
    })
  }
}
export class PropertyNative<T> {
  constructor(public name: MpvPropertyNativeName | (string & {})) {}
  get value(): T {
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

  observe(fn: (value: T) => void, isEqual = Object.is) {
    let lastValue: T
    observeProperty(this.name, "native", (_, value: T) => {
      if (typeof lastValue === "undefined" || !isEqual(value, lastValue)) {
        lastValue = value
        fn(value)
      }
    })
  }
}
