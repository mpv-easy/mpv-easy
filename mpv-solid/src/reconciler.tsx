import {
  getNextSibling,
  insertBeforeNode,
  removeChildNode,
  getFirstChild,
  getParentNode,
  setAttribute,
  setLayoutNode,
} from "@r-tui/flex"
import { createRenderer } from "solid-js/universal"
import { DefaultFps, MpFlex, RenderConfig, renderNode } from "@mpv-easy/flex"
import { BoxName, MpDom, RootName, TextName, createNode } from "@mpv-easy/flex"
import throttle from "lodash-es/throttle"
import { MpvPropertyTypeMap, PropertyNative } from "@mpv-easy/tool"

let flex: MpFlex
const showFps = true
let max = 0
let frame = 0
const fpsList: number[] = []
const customRender = throttle(
  () => {
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
  },
  1000 / DefaultFps,
  { trailing: true, leading: false },
)

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
    return createNode(BoxName)
  },
  createTextNode(value: string): any {
    throw new Error("not support text node")
  },
  replaceText(textNode: MpDom, value: string) {
    textNode.attributes.text = value
    customRender()
  },
  setProperty(node: MpDom, name: keyof MpDom["attributes"], value: any) {
    setAttribute(node, name, value)
    customRender()
  },
  insertNode(parent: MpDom, node: MpDom, anchor: MpDom) {
    insertBeforeNode(parent, node, anchor)
    customRender()
  },
  isTextNode(node: MpDom) {
    return node.props.nodeName === TextName
  },
  removeNode(parent: MpDom, node: MpDom) {
    removeChildNode(parent, node)
    customRender()
  },
  getParentNode(node: MpDom) {
    return getParentNode(node)
  },
  getFirstChild(node: MpDom) {
    return getFirstChild(node)
  },
  getNextSibling(node: MpDom) {
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
    setAttribute(flex.rootNode, "id", RootName)
    setAttribute(flex.rootNode, "width", w)
    setAttribute(flex.rootNode, "height", h)
    setAttribute(flex.rootNode, "position", "relative")
    setAttribute(flex.rootNode, "color", "FFFFFF")
    setAttribute(flex.rootNode, "backgroundColor", "000000FF")
    setAttribute(flex.rootNode, "display", "flex")
    setAttribute(flex.rootNode, "padding", 0)
    setAttribute(flex.rootNode, "borderSize", 0)
    setAttribute(flex.rootNode, "x", 0)
    setAttribute(flex.rootNode, "y", 0)
    setAttribute(flex.rootNode, "zIndex", 0)
    setAttribute(flex.rootNode, "alignContent", "stretch")

    setLayoutNode(flex.rootNode, "x", 0)
    setLayoutNode(flex.rootNode, "y", 0)
    setLayoutNode(flex.rootNode, "width", w)
    setLayoutNode(flex.rootNode, "height", h)
    setLayoutNode(flex.rootNode, "padding", 0)
    setLayoutNode(flex.rootNode, "border", 0)

    customRender()
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
