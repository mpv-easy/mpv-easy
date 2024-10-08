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
import "core-js/stable/escape"
import "core-js/stable/unescape"

// @ts-ignore
import Promise from "core-js/stable/promise"
// @ts-ignore
import Set from "core-js/stable/set"
// @ts-ignore
import Map from "core-js/stable/map"
// @ts-ignore
import Symbol from "es-symbol"
import { getGlobal } from "./global"
import { TextDecoder, TextEncoder } from "textcodec"
import { encodeURIComponent, decodeURIComponent } from "uri-component"

const g = getGlobal()
for (const [name, value] of Object.entries({
  TextEncoder,
  TextDecoder,
  Map,
  WeakMap: Map,
  Set,
  WeakSet: Set,
  Symbol,
  Promise,
  encodeURIComponent,
  decodeURIComponent,
})) {
  // @ts-ignore
  if (!globalThis[name]) {
    // @ts-ignore
    globalThis[name] = value
  }
}

if (!g.performance) {
  g.performance = {
    now: () => +new Date(),
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
