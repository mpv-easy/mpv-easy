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
// @ts-expect-error
import Symbol from "es-symbol"
import { TextDecoder, TextEncoder } from "textcodec"
import { encodeURIComponent, decodeURIComponent } from "uri-component"
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
  // @ts-expect-error
} from "typedarray"
import { MessageChannel } from "./message-channel"
import { patch } from "./tool"
// @ts-expect-error
import URL from "url-parse"
patch({
  TextEncoder,
  TextDecoder,
  Symbol,
  encodeURIComponent,
  decodeURIComponent,
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
  URL,
})
