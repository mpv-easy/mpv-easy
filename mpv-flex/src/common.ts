import { type BaseDom, setAttribute, setProp } from "./dom"
export const attributesToSkip = {
  children: true,
  ref: true,
  key: true,
  style: true,
  forwardedRef: true,
  unstable_applyCache: true,
  unstable_applyDrawHitFromCache: true,
  className: true,
}

export function applyAttributes<
  D extends BaseDom<any, any, any>,
  K extends keyof D["attributes"],
>(node: D, attributes: Record<K, any>) {
  const oldAttrs = node.attributes
  for (const name in oldAttrs) {
    if (name in oldAttrs && !(name in attributes)) {
      // @ts-ignore
      setAttribute(node, name, undefined)
    }
  }
  for (const name in attributes) {
    if (!attributesToSkip[name as keyof typeof attributesToSkip])
      setAttribute(node, name, attributes[name])
  }
}

export function applyProps<
  D extends BaseDom<any, any, any>,
  K extends keyof D["props"],
>(node: D, props: Record<K, any>) {
  for (const name in props) {
    setProp(node, name, props[name])
  }
}
