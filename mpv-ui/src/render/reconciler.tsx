import type React from "react"
import {
  type KeyEvent,
  type MpvPropertyTypeMap,
  PropertyNative,
  addForcedKeyBinding,
  addKeyBinding,
  command,
  commandNativeAsync,
  observeProperty,
  print,
} from "@mpv-easy/tool"
import type { MousePos } from "@mpv-easy/tool"
import createReconciler from "react-reconciler"
import { DefaultEventPriority } from "react-reconciler/constants"
import { DefaultFps, dispatchEvent, getRootFlex, type MpFlex } from "./flex"
import {
  appendChildNode,
  insertBeforeNode,
  removeChildNode,
  applyProps,
} from "@r-tui/flex"
import { type MpDom, createNode, MouseEvent } from "./dom"
import throttle from "lodash-es/throttle"
const NO_CONTEXT = {}

export function createCustomReconciler(customRender: () => void) {
  return createReconciler({
    supportsMutation: true,
    supportsPersistence: false,
    appendChildToContainer(root: MpDom, node: MpDom) {
      appendChildNode(root, node)
      customRender()
    },
    insertInContainerBefore: insertBeforeNode,
    commitUpdate(node: MpDom, props) {
      applyProps(node, props)
      customRender()
    },
    commitTextUpdate(node, _oldText, newText) {
      throw new Error("not support Text Component update")
    },
    commitMount() {},
    removeChildFromContainer(root: MpDom, node: MpDom) {
      removeChildNode(root, node)
      customRender()
    },
    createInstance: (
      originalType: unknown,
      props: unknown,
      rootContainer: unknown,
      hostContext: unknown,
      internalHandle: any,
    ): unknown => {
      const node = createNode("@mpv-easy/box")
      applyProps(node, props)
      return node
    },
    createTextInstance: (
      text: string,
      rootContainer: unknown,
      hostContext: unknown,
      internalHandle: any,
    ): unknown => {
      throw new Error("not support Text components")
    },
    hideTextInstance(node) {},
    unhideTextInstance(node, text) {},
    hideInstance(node) {},
    unhideInstance(node) {},
    appendInitialChild: (parentInstance: MpDom, child: MpDom): void => {
      appendChildNode(parentInstance, child)
      customRender()
    },
    appendChild(parentInstance: MpDom, child: MpDom): void {
      appendChildNode(parentInstance, child)
      customRender()
    },
    insertBefore(
      parentInstance: MpDom,
      child: MpDom,
      beforeChild: MpDom,
    ): void {
      insertBeforeNode(parentInstance, child, beforeChild)
      customRender()
    },
    finalizeInitialChildren: (
      instance: unknown,
      type: unknown,
      props: unknown,
      rootContainer: unknown,
      hostContext: unknown,
    ): boolean => {
      return false
    },
    prepareUpdate: (
      instance: unknown,
      type: unknown,
      oldProps: unknown,
      newProps: unknown,
      rootContainer: unknown,
      hostContext: unknown,
    ): unknown => {
      return newProps
    },
    shouldSetTextContent: (type: unknown, props: unknown): boolean => {
      return false
    },
    getRootHostContext: (rootContainer: unknown): unknown => {
      return NO_CONTEXT
    },
    getChildHostContext: (
      parentHostContext: unknown,
      type: unknown,
      rootContainer: unknown,
    ): unknown => {
      return NO_CONTEXT
    },
    getPublicInstance: (instance: unknown): unknown => {
      return instance
    },
    prepareForCommit: (containerInfo: unknown): Record<string, any> | null => {
      return null
    },
    resetTextContent(instance: unknown) {},
    // shouldDeprioritizeSubtree() {

    // },
    clearContainer: () => {},
    resetAfterCommit: (containerInfo: unknown): void => {},
    preparePortalMount: (containerInfo: unknown): void => {},
    scheduleTimeout: (
      fn: (...args: unknown[]) => unknown,
      delay?: number | undefined,
    ): unknown => {
      return setTimeout(fn, delay)
    },
    cancelTimeout: (id: number) => {
      return clearTimeout(id)
    },
    noTimeout: -1,
    // isXRenderer: true,
    isPrimaryRenderer: true,
    // warnsIfNotActing: true,
    getCurrentEventPriority: (): number => {
      return DefaultEventPriority
    },
    getInstanceFromNode: (node: any): null => {
      return null
    },
    beforeActiveInstanceBlur: (): void => {},
    afterActiveInstanceBlur: (): void => {},
    prepareScopeUpdate: (scopeInstance: any, instance: any): void => {},
    getInstanceFromScope: (scopeInstance: any): unknown => {
      return null
    },
    detachDeletedInstance: (node: MpDom): void => {
      for (const ovl of node.props.osdOverlays) {
        ovl.data = ""
        ovl.computeBounds = false
        ovl.hidden = true
        // ovl.update()
        ovl.remove()
      }
      const { backgroundImage } = node.attributes
      if (typeof backgroundImage === "string") {
        node.props.imageOverlay?.remove()
        node.props.imageOverlay?.destroy()
      }
    },
    removeChild(parentInstance: MpDom, child: MpDom) {
      removeChildNode(parentInstance, child)
      customRender()
    },
    supportsHydration: false,
  })
}

export type RenderConfig = {
  flex: MpFlex
  enableMouseMoveEvent: boolean
  fps: number
  customRender: () => void
  customDispatch: (
    node: MpDom,
    pos: MousePos,
    event: KeyEvent,
    mouseEvent?: MouseEvent,
  ) => void
  showFps?: boolean
}

let max = 0
let min = 1 << 20
let sum = 0
const fpsList: number[] = []

export function createRender({
  enableMouseMoveEvent = true,
  fps = DefaultFps,
  flex = getRootFlex(),
  showFps = false,
  customRender = throttle(
    () => {
      const st = +Date.now()
      flex.renderToMpv()
      const ed = +Date.now()
      const t = ed - st
      max = Math.max(max, t)
      min = Math.min(min, t)
      sum += t
      fpsList.push(t)
      if (fpsList.length > 32) {
        fpsList.shift()
      }
      const every = fpsList.reduce((a, b) => a + b, 0) / fpsList.length
      if (showFps) {
        print("render time:", ed, min, max, every)
      }
    },
    1000 / fps,
    {
      trailing: true,
      leading: true,
    },
  ),
  customDispatch = dispatchEvent,
}: Partial<RenderConfig> = {}) {
  const reconciler = createCustomReconciler(customRender)
  return (reactNode: React.ReactNode) => {
    const container = reconciler.createContainer(
      flex.rootNode,
      0,
      null,
      false,
      null,
      "",
      (e) => {
        throw e
      },
      null,
    )

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

    let lastW = 0
    let lastH = 0
    function renderRootNode({ w, h }: MpvPropertyTypeMap["osd-dimensions"]) {
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
      reconciler.updateContainer(reactNode, container, null, null)
      customRender()
    }
    const dim = new PropertyNative<MpvPropertyTypeMap["osd-dimensions"]>(
      "osd-dimensions",
    )
    renderRootNode(dim.value)
    dim.observe((value) => {
      renderRootNode(value)
    })
  }
}

let r: (reactNode: React.ReactNode) => void
export const render: (reactNode: React.ReactNode) => void = (
  reactNode: React.ReactNode,
) => {
  if (!r) {
    r = createRender({})
  }
  return r(reactNode)
}
