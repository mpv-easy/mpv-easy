import {
  type MpDom,
  MpFlex,
  getNextSibling,
  insertBeforeNode,
  removeChildNode,
  getFirstChild,
  getParentNode,
  setAttribute,
  setLayoutNode,
  DefaultFps,
  RenderConfig,
  renderNode,
  BoxName,
  RootName,
  TextName,
  createNode,
  BaseDom,
  MpAttrs,
  MpEvent,
  MpProps,
  getRootFlex,
} from "@mpv-easy/flex"
import { createRenderer } from "solid-js/universal"
import throttle from "lodash-es/throttle"
import {
  addKeyBinding,
  KeyEvent,
  MousePos,
  MpvPropertyTypeMap,
  observeProperty,
  PropertyNative,
} from "@mpv-easy/tool"
import { batch } from "solid-js"

const showFps = true
let max = 0
let frame = 0
const fpsList: number[] = []
let customRender: () => void

function initCustomRender(config: Partial<RenderConfig> = {}) {
  const { fps = DefaultFps } = config
  customRender = throttle(
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
    1000 / fps,
    { trailing: true, leading: false },
  )
}

export function mergeProps(...sources: unknown[]): unknown {
  return Object.assign({}, ...sources)
}

const {
  render: _render,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  setProp,
  spread,
  // mergeProps,
} = createRenderer<MpDom>({
  createElement(nodeName: string): any {
    return createNode(BoxName)
  },
  createTextNode(value: string): any {
    throw new Error("not support text node")
  },
  replaceText(textNode: MpDom, value: string) {
    setAttribute(textNode, "text", value)
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
  const { enableMouseMoveEvent = true } = config
  initCustomRender(config)
  const flex = getRootFlex(config)

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
    batch(() => {
      setAttribute(flex.rootNode, "id", RootName)
      setAttribute(flex.rootNode, "width", w)
      setAttribute(flex.rootNode, "height", h)
      setAttribute(flex.rootNode, "position", "relative")
      setAttribute(flex.rootNode, "color", "#FFFFFF")
      setAttribute(flex.rootNode, "backgroundColor", "#000000FF")
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
    })
    customRender()
  }

  // solidjs render is sync, so must set a init size
  flex.rootNode.attributes.width = dim.value.w
  flex.rootNode.attributes.height = dim.value.h

  dim.observe((value) => {
    renderRootNode(value)
  })

  let lastMousePos: MousePos = { x: 0, y: 0, hover: false }
  observeProperty("mouse-pos", "native", (_, value: MousePos) => {
    lastMousePos = value
    if (enableMouseMoveEvent) {
      customDispatch(flex.rootNode, lastMousePos, {
        event: "press",
        is_mouse: true,
        key: "",
      })
    }
  })

  addKeyBinding(
    "MOUSE_BTN0",
    "MPV_EASY_MOUSE_BTN0",
    (event) => {
      customDispatch(flex.rootNode, lastMousePos, event)
    },
    {
      complex: true,
      repeatable: true,
      forced: false,
    },
  )

  addKeyBinding(
    "MOUSE_BTN3",
    "MPV_EASY_MOUSE_BTN3",
    (event) => {
      customDispatch(flex.rootNode, lastMousePos, event)
    },
    {
      complex: true,
      repeatable: true,
      forced: false,
    },
  )

  addKeyBinding(
    "MOUSE_BTN4",
    "MPV_EASY_MOUSE_BTN4",
    (event) => {
      customDispatch(flex.rootNode, lastMousePos, event)
    },
    {
      complex: true,
      repeatable: true,
      forced: false,
    },
  )
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
  // mergeProps,
}

function customDispatch(
  node: BaseDom<MpAttrs, MpProps, MpEvent>,
  pos: MousePos,
  event: KeyEvent,
) {
  const e = getRootFlex().customCreateMouseEvent(
    node,
    pos.x,
    pos.y,
    pos.hover,
    event,
  )
  getRootFlex().dispatchMouseEvent(node, e)
}
