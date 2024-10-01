import "core-js/stable/array/every"
import "core-js/stable/array/fill"
import "core-js/stable/array/find-index"
import "core-js/stable/array/find"
import "core-js/stable/array/find-last"
import "core-js/stable/array-buffer"
import "core-js/stable/array/find-last-index"
import "core-js/stable/array/for-each"
import "core-js/stable/array/from"
import "core-js/stable/array/some"
import "core-js/stable/array/includes"
import "core-js/stable/array/at"
import "core-js/stable/number"
import "core-js/stable/object/assign"
import "core-js/stable/object/entries"
import "core-js/stable/object/is"
import "core-js/stable/object/values"
import "core-js/stable/string/pad-end"
import "core-js/stable/string/pad-start"
import "core-js/stable/string/at"
import "core-js/stable/string"
import "core-js/stable/structured-clone"
import "core-js/stable/typed-array"

// @ts-ignore
import Promise from "core-js/stable/promise"
// @ts-ignore
import Set from "core-js/stable/set"
// @ts-ignore
import Map from "core-js/stable/map"
// @ts-ignore
import Symbol from "es-symbol"
import { getGlobal } from "./global"
import { TextEncoder } from "@polkadot/x-textencoder"
import { TextDecoder } from "@polkadot/x-textdecoder"
import { encodeURIComponent, decodeURIComponent } from "uri-component"

const g = getGlobal()
// g.Buffer = Buffer
g.TextEncoder = TextEncoder
g.TextDecoder = TextDecoder
g.Map = Map
g.WeakMap = Map
g.Set = Set
g.WeakSet = Set
g.Symbol = Symbol
g.Promise = Promise

if (!g.performance) {
  g.performance = {
    now: () => +new Date(),
  }
}

if (!Array.prototype.fill) {
  Array.prototype.fill = function (value, start, end) {
    // 处理参数缺失的情况
    if (start === undefined) start = 0
    if (end === undefined) end = this.length

    // 处理负数索引的情况
    start = start >= 0 ? start : Math.max(0, this.length + start)
    end = end >= 0 ? end : Math.max(0, this.length + end)

    // 开始填充数组
    for (let i = start; i < end; i++) {
      this[i] = value
    }
    return this
  }
}

function setProtoOf(obj: any, proto: any) {
  obj.__proto__ = proto
  return obj
}

function mixinProperties(obj: any, proto: any) {
  for (const prop in proto) {
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
      obj[prop] = proto[prop]
    }
  }
  return obj
}
Object.setPrototypeOf =
  // biome-ignore lint/suspicious/useIsArray: <explanation>
  { __proto__: [] } instanceof Array ? setProtoOf : mixinProperties

export { Map, Set, Symbol }
g.encodeURIComponent = encodeURIComponent
g.decodeURIComponent = decodeURIComponent
