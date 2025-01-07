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
import { BoolProp, NumberProp, Prop, StringProp } from "./type"

export class Property<T> {
  constructor(public name: string) {}
}

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
    observeProperty(this.name, "number", (name: string, value: number) => {
      if (last !== value || typeof last === "undefined") {
        fn(name, value)
        last = value
      }
    })
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
    observeProperty(this.name, "bool", (name, value) => {
      if (last !== value || typeof last === "undefined") {
        fn(name, value)
        last = value
      }
    })
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
    observeProperty(this.name, "string", (name, value) => {
      if (last !== value || typeof last === "undefined") {
        fn(name, value)
        last = value
      }
    })
  }
}
export class PropertyNative<K extends keyof Prop, T = Prop[K]> {
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

  observe(fn: (name: string, value: T) => void, isEqual = Object.is) {
    let lastValue: T
    observeProperty(this.name, "native", (name: string, value: T) => {
      if (typeof lastValue === "undefined" || !isEqual(value, lastValue)) {
        lastValue = value
        fn(name, value)
      }
    })
  }
}
