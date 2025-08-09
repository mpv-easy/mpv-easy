function setProtoOf(obj: any, proto: any) {
  obj.__proto__ = proto
  return obj
}

function mixinProperties(obj: any, proto: any) {
  for (const prop in proto) {
    // biome-ignore lint: don't change to hasOwn
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
      obj[prop] = proto[prop]
    }
  }
  return obj
}

if (typeof Object.setPrototypeOf !== "function") {
  Object.setPrototypeOf =
    // biome-ignore lint/suspicious/useIsArray: hack
    { __proto__: [] } instanceof Array ? setProtoOf : mixinProperties
}
