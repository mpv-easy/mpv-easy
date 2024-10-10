import type React from "react"
import {
  type MpvPropertyTypeMap,
  PropertyNative,
  addKeyBinding,
  observeProperty,
  print,
} from "@mpv-easy/tool"
import type { MousePos } from "@mpv-easy/tool"
import createReconciler from "react-reconciler"
import { DefaultEventPriority } from "react-reconciler/constants"
import {
  appendChildNode,
  insertBeforeNode,
  removeChildNode,
  setAttribute,
  setLayoutNode,
  applyAttributes,
} from "@mpv-easy/flex"

import {
  createNode,
  DefaultFps,
  type MpDom,
  type RenderConfig,
  dispatchEvent,
  getRootFlex,
  renderNode,
  RootName,
} from "./flex"

import throttle from "lodash-es/throttle"
const NO_CONTEXT = {}

function detachDeletedInstance(node: MpDom) {
  for (const c of node.childNodes) {
    detachDeletedInstance(c)
  }

  for (const ovl of node.props.osdOverlays) {
    ovl.remove()
  }

  const { backgroundImage } = node.attributes
  if (typeof backgroundImage === "string") {
    node.props.imageOverlay?.remove()
    node.props.imageOverlay?.destroy()
  }
}

export function createCustomReconciler(customRender: () => void) {
  return createReconciler({
    supportsMutation: true,
    supportsPersistence: false,
    supportsMicrotasks: false,
    appendChildToContainer(root: MpDom, node: MpDom) {
      appendChildNode(root, node)
      customRender()
    },
    insertInContainerBefore: insertBeforeNode,
    commitUpdate(node: MpDom, props: any) {
      applyAttributes(node, props)
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
      props: any,
      rootContainer: unknown,
      hostContext: unknown,
      internalHandle: any,
    ): unknown => {
      const node = createNode("@mpv-easy/box")
      applyAttributes(node, props)
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
    detachDeletedInstance(node: MpDom): void {
      detachDeletedInstance(node)
    },
    removeChild(parentInstance: MpDom, child: MpDom) {
      removeChildNode(parentInstance, child)
      customRender()
    },
    supportsHydration: false,
  })
}

let max = 0
let frame = 0
const fpsList: number[] = []

export function createRender({
  enableMouseMoveEvent = true,
  fps = DefaultFps,
  flex = getRootFlex(),
  showFps = false,
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
        print("render time(react):", frame, t, max, avg)
      }
    },
    1000 / fps,
    {
      leading: true,
      trailing: true,
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
      "MPV_EASY_MOUSE_LEFT",
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
      "MOUSE_BTN1",
      "MPV_EASY_MOUSE_MID",
      (event) => {
        customDispatch(flex.rootNode, lastMousePos, event)
      },
      {
        complex: true,
        repeatable: true,
        forced: false,
      },
    )

    // addKeyBinding(
    //   "MOUSE_BTN2",
    //   "MPV_EASY_MOUSE_RIGHT",
    //   (event) => {
    //     customDispatch(flex.rootNode, lastMousePos, event)
    //   },
    //   {
    //     complex: true,
    //     repeatable: true,
    //     forced: false,
    //   },
    // )

    addKeyBinding(
      "MOUSE_BTN3",
      "MPV_EASY_WHEEL_UP",
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
      "MPV_EASY_WHEEL_DOWN",
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

      reconciler.updateContainer(reactNode, container, null, null)

      customRender()
    }
    const dim = new PropertyNative<MpvPropertyTypeMap["osd-dimensions"]>(
      "osd-dimensions",
    )
    renderRootNode(dim.value)
    dim.observe((value) => {
      // HACK: delay render
      setTimeout(() => renderRootNode(value))
    })
  }
}

let r: (reactNode: React.ReactNode) => void
export const render = (
  reactNode: React.ReactNode,
  config: Partial<RenderConfig> = {},
) => {
  if (!r) {
    r = createRender(config)
  }
  return r(reactNode)
}
