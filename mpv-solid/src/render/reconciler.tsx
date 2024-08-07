import {
  appendChildNode,
  getNextSibling,
  insertBeforeNode,
  removeChildNode,
} from "@r-tui/flex"
import { createRenderer } from "solid-js/universal"
import fs from "node:fs"
import { Shape } from "@r-tui/share"
// import { getNextSibling } from "@r-tui/flex"

import { from, JSXElement } from "solid-js"
import { DefaultFps, MpFlex, RenderConfig, renderNode } from "./flex"
import { BoxName, MpDom, TextName, createNode } from "./dom"
import throttle from "lodash-es/throttle"
import { MpvPropertyTypeMap, PropertyNative } from "@mpv-easy/tool"

const log = (...args: any[]) => {
  // console.log(`[RENDERER] `, ...args)
}

// const flex = new TFlex({
//   write: s => {
//     // console.log(s.slice(100))
//     fs.writeFileSync("./a.log", s)
//     process.stdout.write(s)
//   }
// })

let flex: MpFlex
const showFps = true
let max = 0
let frame = 0
const fpsList: number[] = []
const customRender = throttle(() => {
  frame++
  const st = +Date.now()
  renderNode()
  const ed = +Date.now()
  const t = ed - st
  max = Math.max(max, t)
  fpsList.push(t)
  if (fpsList.length > 32) {
    fpsList.shift()
  }
  const avg = fpsList.reduce((a, b) => a + b, 0) / fpsList.length
  if (showFps) {
    print("render time(solid):", frame, t, max, avg)
  }
}, 1000 / DefaultFps)

const {
  render: _render,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps,
} = createRenderer<MpDom>({
  createElement(nodeName: string): any {
    log("creating element", nodeName)
    return createNode(BoxName)
  },
  createTextNode(value: string): any {
    log("createTextNode")
    throw new Error("not support text node")
  },
  replaceText(textNode: MpDom, value: string) {
    log("replaceText", value)
    textNode.attributes.text = value
    customRender()
  },
  setProperty(node: MpDom, name: string, value: any) {
    log("setProperty", node.attributes.id, name, value)
    // @ts-ignore
    node.attributes[name] = value
    customRender()
  },
  insertNode(parent: MpDom, node: MpDom, anchor: MpDom) {
    log(
      "insertNode",
      parent.attributes.id,
      node.attributes.id,
      node.childNodes[0]?.attributes?.id,
    )
    insertBeforeNode(parent, node, anchor)
    customRender()
  },
  isTextNode(node: MpDom) {
    log("isTextNode")
    return node.props.nodeName === TextName
  },
  removeNode(parent: MpDom, node: MpDom) {
    log("removeNode", node)
    removeChildNode(parent, node)
    customRender()
  },
  getParentNode(node: MpDom) {
    log("getParentNode", node)
    return node.parentNode
  },
  getFirstChild(node: MpDom) {
    log("getFirstChild", node)
    return node.childNodes[0]
  },
  getNextSibling(node: MpDom) {
    log("getNextSibling", node)
    return getNextSibling(node) as MpDom
  },
})

// Forward Solid control flow
export {
  For,
  Show,
  Suspense,
  SuspenseList,
  Switch,
  Match,
  Index,
  ErrorBoundary,
} from "solid-js"

export const defaultFPS = 30


function render(code: () => any, config: Partial<RenderConfig> = {}) {
  flex = new MpFlex()
  const dim = new PropertyNative<MpvPropertyTypeMap["osd-dimensions"]>(
    "osd-dimensions",
  )
  let lastW = 0
  let lastH = 0
  const renderRootNode = ({ w, h }: MpvPropertyTypeMap["osd-dimensions"]) => {
    if (!w || !h || (lastW === w && lastH === h)) {
      return
    }
    lastW = w
    lastH = h
    const { attributes, layoutNode } = flex.rootNode
    attributes.id = "__root__"
    attributes.width = w
    attributes.height = h
    attributes.position = "relative"
    attributes.color = "FFFFFF"
    attributes.display = "flex"
    attributes.backgroundColor = "000000FF"
    attributes.padding = 0
    attributes.borderSize = 0
    attributes.x = 0
    attributes.y = 0
    attributes.zIndex = 0
    attributes.alignContent = "stretch"
    layoutNode.x = 0
    layoutNode.y = 0
    layoutNode.width = w
    layoutNode.height = h
    layoutNode.padding = 0
    layoutNode.border = 0

    // customRender()
  }

  dim.observe((value) => {
    renderRootNode(value)
  })
  renderRootNode(dim.value)

  _render(code, flex.rootNode)
}

export {
  render,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps,
}
