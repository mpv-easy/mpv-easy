import "./polyfill"
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
import "core-js/stable/object/proto"
// FIXME: https://github.com/zloirock/core-js/issues/1375
// import "core-js/stable/object/set-prototype-of"
import "core-js/stable/object/entries"
import "core-js/stable/object/is"
import "core-js/stable/object/values"
import "core-js/stable/string/pad-end"
import "core-js/stable/string/pad-start"
import "core-js/stable/string/at"
import "core-js/stable/string"
import "core-js/stable/structured-clone"
// import "core-js/stable/typed-array"
import "core-js/stable/escape"
import "core-js/stable/unescape"
import "core-js/stable/promise"
import "core-js/stable/set"
import "core-js/stable/map"
import "core-js/stable/weak-map"
import "core-js/stable/weak-set"
// @ts-ignore
import Symbol from "es-symbol"
import { getGlobal } from "./global"
import { TextDecoder, TextEncoder } from "textcodec"
import { encodeURIComponent, decodeURIComponent } from "uri-component"
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { Buffer } from "buffer"
import {
  ArrayBuffer,
  DataView,
  Float32Array,
  Float64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  // @ts-ignore
} from "typedarray"
import { MessageChannel } from "./message-channel"

const g = getGlobal()
for (const [name, value] of Object.entries({
  TextEncoder,
  TextDecoder,
  Symbol,
  encodeURIComponent,
  decodeURIComponent,
  Buffer,
  ArrayBuffer,
  DataView,
  Float32Array,
  Float64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  MessageChannel,
})) {
  if (!g[name]) {
    g[name] = value
  }
}

if (!g.performance) {
  g.performance = {
    now: () => Date.now(),
  }
}
