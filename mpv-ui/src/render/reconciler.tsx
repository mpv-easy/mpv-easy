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
import React from "react"
import createReconciler from "react-reconciler"
import { DefaultEventPriority } from "react-reconciler/constants"

import {
  type DOMElement,
  appendChildNode,
  createNode,
  insertBeforeNode,
  removeChildNode,
  type MouseEvent,
} from "./dom"
import { RootId, getRootNode, dispatchEvent, renderNode } from "./flex"
import { applyProps } from "../common"

const NO_CONTEXT = {}
export let currentRenderCount = -1

import { throttle } from "lodash-es"

export function createCustomReconciler(
  customRenderNode: (node: DOMElement) => void,
) {
  return createReconciler({
    supportsMutation: true,
    supportsPersistence: false,
    appendChildToContainer(root: DOMElement, node: DOMElement) {
      appendChildNode(root, node)
      customRenderNode(getRootNode())
    },
    insertInContainerBefore: insertBeforeNode,
    commitUpdate(node: DOMElement, props) {
      applyProps(node, props)
      customRenderNode(getRootNode())
    },
    commitTextUpdate(node, _oldText, newText) {
      throw new Error("not support Text Component update")
    },
    commitMount() { },
    removeChildFromContainer(root: DOMElement, node: DOMElement) {
      removeChildNode(root, node)
      customRenderNode(getRootNode())
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
    hideTextInstance(node) { },
    unhideTextInstance(node, text) { },
    hideInstance(node) { },
    unhideInstance(node) { },
    appendInitialChild: (
      parentInstance: DOMElement,
      child: DOMElement,
    ): void => {
      appendChildNode(parentInstance, child)
      customRenderNode(getRootNode())
    },
    appendChild(parentInstance: DOMElement, child: DOMElement): void {
      appendChildNode(parentInstance, child)
      customRenderNode(getRootNode())
    },
    insertBefore(
      parentInstance: DOMElement,
      child: DOMElement,
      beforeChild: DOMElement,
    ): void {
      insertBeforeNode(parentInstance, child, beforeChild)
      customRenderNode(getRootNode())
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
    resetTextContent(instance: unknown) { },
    // shouldDeprioritizeSubtree() {

    // },
    clearContainer: () => { },
    resetAfterCommit: (containerInfo: unknown): void => { },
    preparePortalMount: (containerInfo: unknown): void => { },
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
    beforeActiveInstanceBlur: (): void => { },
    afterActiveInstanceBlur: (): void => { },
    prepareScopeUpdate: (scopeInstance: any, instance: any): void => { },
    getInstanceFromScope: (scopeInstance: any): unknown => {
      return null
    },
    detachDeletedInstance: (node: DOMElement): void => {
      for (const ovl of node.osdOverlays) {
        ovl.data = ""
        ovl.computeBounds = false
        ovl.hidden = true
        // ovl.update()
        ovl.remove()
      }
      const { backgroundImage, id } = node.attributes
      if (typeof backgroundImage === "string") {
        node.imageOverlay?.remove()
        node.imageOverlay?.destroy()
      }
    },
    removeChild(parentInstance: DOMElement, child: DOMElement) {
      removeChildNode(parentInstance, child)
      customRenderNode(getRootNode())
    },
    supportsHydration: false,
  })
}

export type RenderConfig = {
  enableMouseMoveEvent: boolean
  fps: number
  customRender: (node: DOMElement) => void
  customDispatch: (
    node: DOMElement,
    pos: MousePos,
    event: KeyEvent,
    mouseEvent?: MouseEvent,
  ) => void
}

export const defaultFPS = 30

// let max = 0
// let min = 1 << 20
// let sum = 0

export function createRender({
  enableMouseMoveEvent = true,
  fps = defaultFPS,
  customRender = throttle(
    () => {
      // const st = +Date.now()
      renderNode(getRootNode(), ++currentRenderCount, 0)
      // const ed = +Date.now()
      // const t = ed - st
      // max = Math.max(max, t)
      // min = Math.min(min, t)
      // sum += t
      // const every = sum / (currentRenderCount + 1)
      // print("render time:", currentRenderCount, t, min, max, every)
    },
    1000 / fps,
    {
      trailing: true,
      leading: true,
    },
  ),
  customDispatch = throttle<typeof dispatchEvent>(
    (node, pos, event, mouseEvent) => {
      dispatchEvent(node, pos, event, mouseEvent)
    },
    0,
    {
      trailing: true,
      leading: true,
    },
  ),
}: Partial<RenderConfig> = {}) {
  const reconciler = createCustomReconciler(customRender)
  return (reactNode: React.ReactNode) => {
    const container = reconciler.createContainer(
      getRootNode(),
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
        customDispatch(getRootNode(), lastMousePos, {
          event: "press",
          is_mouse: true,
        })
      }
    })

    addKeyBinding(
      "MOUSE_BTN0",
      "MPV_EASY_MOUSE_BTN0",
      (event) => {
        customDispatch(getRootNode(), lastMousePos, event)
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
        customDispatch(getRootNode(), lastMousePos, event)
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
        customDispatch(getRootNode(), lastMousePos, event)
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
      const { attributes, layoutNode } = getRootNode()
      attributes.id = RootId
      attributes.width = w
      attributes.height = h
      attributes.position = "relative"
      attributes.color = "FFFFFF"
      attributes.display = "flex"
      attributes.backgroundColor = "000000FF"
      // attributes.padding = 0
      // attributes.borderSize = 0
      attributes.x = 0
      attributes.y = 0
      attributes.zIndex = 0

      layoutNode.x = 0
      layoutNode.y = 0
      layoutNode.width = w
      layoutNode.height = h
      layoutNode.padding = 0
      layoutNode.border = 0
      reconciler.updateContainer(reactNode, container, null, null)
      customRender(getRootNode())
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

export const render = createRender({
  // enableMouseMoveEvent: true,
  // customRender: defaultRootRerender,
})
