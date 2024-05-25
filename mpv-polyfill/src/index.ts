import "core-js/stable/array/every"
import "core-js/stable/array/fill"
import "core-js/stable/array/find-index"
import "core-js/stable/array/find"
import "core-js/stable/array/find-last"
import "core-js/stable/array/for-each"
import "core-js/stable/array/from"
import "core-js/stable/array/some"
import "core-js/stable/array/includes"
import "core-js/stable/array/at"
// @ts-ignore
import Map from "core-js/stable/map"
// import "core-js/stable/object"
import "core-js/stable/object/assign"
import "core-js/stable/object/entries"
import "core-js/stable/object/entries"
import "core-js/stable/object/is"
import "core-js/stable/object/values"
// import "core-js/stable/object/set-prototype-of"

// @ts-ignore
import Promise from "core-js/stable/promise"
// @ts-ignore
import Set from "core-js/stable/set"
import "core-js/stable/string/pad-end"
import "core-js/stable/string/pad-start"
import "core-js/stable/string/at"
import "core-js/stable/string"

// import "core-js/stable/atob"
// import "core-js/stable/btoa"
import "core-js/stable/typed-array"
import "core-js/stable/array-buffer"

// @ts-ignore
import Symbol from "es-symbol"
import { getGlobal } from "./global"
import { TextEncoder } from "@polkadot/x-textencoder"

// TODO: add global Buffer
// import { Buffer } from 'buffer'


const g = getGlobal()
// g.Buffer = Buffer
g.TextEncoder = TextEncoder
g.Map = Map
g.WeakMap = Map
g.Set = Set
g.WeakSet = Set
g.Symbol = Symbol
g.Promise = Promise

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
// if (!String.prototype.find) {
//   String.prototype.find = function (searchString, position) {
//     if (this == null) {
//       throw new TypeError('String.prototype.find called on null or undefined');
//     }
//     let str = String(this);
//     let len = str.length;
//     let start = position ? Number(position) || 0 : 0;

//     // Loop through the string to find the searchString
//     for (let i = start; i < len; i++) {
//       if (str.charAt(i) === searchString.charAt(0)) {
//         let substr = str.substr(i, searchString.length);
//         if (substr === searchString) {
//           return i;
//         }
//       }
//     }

//     return -1; // Return -1 if searchString is not found
//   };
// }

// Polyfill for Array.prototype.find()
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    value: function (predicate: any) {
      if (this == null) {
        throw new TypeError("Array.prototype.find called on null or undefined")
      }
      if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function")
      }
      const list = Object(this)
      const length = list.length >>> 0
      const thisArg = arguments[1]

      for (let i = 0; i < length; i++) {
        if (i in list) {
          const value = list[i]
          if (predicate.call(thisArg, value, i, list)) {
            return value
          }
        }
      }
      return undefined
    },
  })
}

function setProtoOf(obj: any, proto: any) {
  obj.__proto__ = proto
  return obj
}

function mixinProperties(obj: any, proto: any) {
  for (var prop in proto) {
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
      obj[prop] = proto[prop]
    }
  }
  return obj
}
Object.setPrototypeOf =
  { __proto__: [] } instanceof Array ? setProtoOf : mixinProperties

export { Map, Set, Symbol }
