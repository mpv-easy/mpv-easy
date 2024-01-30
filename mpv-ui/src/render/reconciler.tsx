import {
  MpvPropertyTypeMap,
  PropertyNative,
  addForcedKeyBinding,
  observeProperty,
} from "@mpv-easy/tool"
import { MousePos } from "@mpv-easy/tool"
import React from "react"
import createReconciler from "react-reconciler"
import { DefaultEventPriority } from "react-reconciler/constants"

import {
  DOMElement,
  appendChildNode,
  createNode,
  insertBeforeNode,
  removeChildNode,
} from "./dom"
import { RootId, RootNode, dispatchEvent, renderNode } from "./flex"
import { applyProps } from "../common"

const NO_CONTEXT = {}
export let currentRenderCount = -1

export const reconciler = createReconciler({
  supportsMutation: true,
  supportsPersistence: false,
  appendChildToContainer(root: DOMElement, node: DOMElement) {
    appendChildNode(root, node)
  },
  insertInContainerBefore: insertBeforeNode,
  commitUpdate(node: DOMElement, props) {
    applyProps(node, props)
    renderNode(node, 0, currentRenderCount++)
  },
  commitTextUpdate(node, _oldText, newText) {
    throw new Error("not support Text Component update")
  },
  commitMount() {},
  removeChildFromContainer(root: DOMElement, node: DOMElement) {
    removeChildNode(root, node)
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
  appendInitialChild: (parentInstance: DOMElement, child: DOMElement): void => {
    appendChildNode(parentInstance, child)
  },
  appendChild: appendChildNode,
  insertBefore: insertBeforeNode,
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
  detachDeletedInstance: (node: DOMElement): void => {
    for (const ovl of node.overlay) {
      ovl.data = ""
      ovl.computeBounds = false
      ovl.hidden = true
      ovl.update()
      ovl.remove()
    }
  },
  removeChild(parentInstance: DOMElement, child: DOMElement) {},
  supportsHydration: false,
})

export type RenderConfig = {
  enableMouseMoveEvent: boolean
}

export function render(
  reactNode: React.ReactNode,
  { enableMouseMoveEvent = true }: Partial<RenderConfig> = {},
) {
  const container = reconciler.createContainer(
    RootNode,
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
      dispatchEvent(RootNode, lastMousePos, { event: "press", is_mouse: true })
    }
  })

  addForcedKeyBinding(
    "MOUSE_BTN0",
    "__MOUSE_BTN0__",
    (event) => {
      dispatchEvent(RootNode, lastMousePos, event)
    },
    {
      complex: true,
      repeatable: true,
      forced: true,
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
    const { attributes, layoutNode } = RootNode
    attributes.id = RootId
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

    layoutNode.x = 0
    layoutNode.y = 0
    layoutNode.width = w
    layoutNode.height = h
    layoutNode.padding = 0
    layoutNode.border = 0

    reconciler.updateContainer(reactNode, container, null, null)
    renderNode(RootNode, 0, currentRenderCount++)
  }
  new PropertyNative<MpvPropertyTypeMap["osd-dimensions"]>(
    "osd-dimensions",
  ).observe((value) => {
    renderRootNode(value)
  })
}
