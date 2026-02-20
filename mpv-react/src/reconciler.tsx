import type React from "react"
import {
  PropertyNative,
  addKeyBinding,
  observeProperty,
  quit,
  registerScriptMessage,
} from "@mpv-easy/tool"
import type { MousePos } from "@mpv-easy/tool"
import createReconciler from "react-reconciler"
import { DiscreteEventPriority } from "react-reconciler/constants"
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

const NO_CONTEXT = {}

// Recursively cleanup node resources
function detachDeletedInstance(node: MpDom): void {
  // Cleanup children first
  for (const c of node.childNodes) {
    detachDeletedInstance(c)
  }

  // Remove OSD overlays
  for (const ovl of node.props.osdOverlays) {
    ovl.remove()
  }

  // Cleanup image overlay if exists
  if (
    typeof node.attributes.backgroundImage === "string" &&
    node.props.imageOverlay
  ) {
    node.props.imageOverlay.remove()
    node.props.imageOverlay.destroy()
  }
}

export function createCustomReconciler(customRender: () => void) {
  return createReconciler({
    supportsMutation: true,
    supportsPersistence: false,
    supportsMicrotasks: false,

    // Priority methods - use constants for better performance
    resolveUpdatePriority: () => DiscreteEventPriority,
    getCurrentUpdatePriority: () => DiscreteEventPriority,
    setCurrentUpdatePriority: () => DiscreteEventPriority,
    maySuspendCommit: () => false,

    // Mutation methods
    appendChildToContainer(root: MpDom, node: MpDom) {
      appendChildNode(root, node)
      customRender()
    },
    insertInContainerBefore: insertBeforeNode,
    commitUpdate(node: MpDom, _tag: string, _oldProps: any, newProps: any) {
      applyAttributes(node, newProps)
      customRender()
    },
    commitTextUpdate() {
      throw new Error("Text components not supported")
    },
    commitMount() {},
    removeChildFromContainer(root: MpDom, node: MpDom) {
      removeChildNode(root, node)
      customRender()
    },
    // export function createInstance(
    //   type: string,
    //   props: Props,
    //   rootContainerInstance: Container,
    //   hostContext: Object,
    //   internalInstanceHandle: Object,
    // ): Instance {
    createInstance: (
      _originalType: unknown,
      props: any,
      _rootContainer: unknown,
      _hostContext: unknown,
      _internalHandle: any,
    ): unknown => {
      const node = createNode("@mpv-easy/box")
      applyAttributes(node, props)
      return node
    },
    createTextInstance: (
      _text: string,
      _rootContainer: unknown,
      _hostContext: unknown,
      _internalHandle: any,
    ): unknown => {
      throw new Error("not support Text components")
    },
    // Visibility methods (no-ops for this renderer)
    hideTextInstance() {},
    unhideTextInstance() {},
    hideInstance() {},
    unhideInstance() {},

    // Child manipulation
    appendInitialChild(parent: MpDom, child: MpDom) {
      appendChildNode(parent, child)
      customRender()
    },
    appendChild(parent: MpDom, child: MpDom) {
      appendChildNode(parent, child)
      customRender()
    },
    insertBefore(parent: MpDom, child: MpDom, beforeChild: MpDom) {
      insertBeforeNode(parent, child, beforeChild)
      customRender()
    },
    removeChild(parent: MpDom, child: MpDom) {
      removeChildNode(parent, child)
      customRender()
    },
    // Configuration methods
    finalizeInitialChildren: () => false,
    shouldSetTextContent: () => false,
    getRootHostContext: () => NO_CONTEXT,
    getChildHostContext: () => NO_CONTEXT,
    getPublicInstance: (instance: unknown) => instance,

    // Commit lifecycle
    prepareForCommit: () => null,
    resetTextContent() {},
    clearContainer() {},
    resetAfterCommit() {},
    preparePortalMount() {},

    // Timing
    scheduleTimeout: setTimeout,
    cancelTimeout: clearTimeout,
    noTimeout: -1,

    // Renderer config
    isPrimaryRenderer: true,
    supportsHydration: false,

    // Instance management
    getInstanceFromNode: () => null,
    beforeActiveInstanceBlur() {},
    afterActiveInstanceBlur() {},
    prepareScopeUpdate() {},
    getInstanceFromScope: () => null,
    detachDeletedInstance,

    // Transition context
    NotPendingTransition: undefined,
    HostTransitionContext: {} as any,

    // Event handling
    resolveEventType: () => null,
    resolveEventTimeStamp: Date.now,
    trackSchedulerEvent() {
      // Silent no-op for performance
    },

    // Unimplemented methods (throw errors)
    resetFormInstance() {
      throw new Error("Forms not supported")
    },
    requestPostPaintCallback() {
      throw new Error("Post-paint callbacks not supported")
    },
    shouldAttemptEagerTransition() {
      throw new Error("Eager transitions not supported")
    },
    preloadInstance() {
      throw new Error("Preloading not supported")
    },
    startSuspendingCommit() {
      throw new Error("Suspending commits not supported")
    },
    suspendInstance() {
      throw new Error("Suspending instances not supported")
    },
    waitForCommitToBeReady() {
      throw new Error("Commit waiting not supported")
    },
  })
}

// Performance tracking state
interface RenderStats {
  frame: number
  max: number
  lastRender: number
  renderHandle: number
  fpsList: number[]
}

const MAX_FPS_LIST_SIZE = 64

function createRenderStats(): RenderStats {
  return {
    frame: 0,
    max: 0,
    lastRender: 0,
    renderHandle: 0,
    fpsList: [],
  }
}

export function createRender({
  enableMouseMoveEvent = true,
  fps = DefaultFps,
  flex = getRootFlex(),
  showFps = false,
  maxFpsFrame = 64,
  throttle = true,
  frameLimit = 0,
  customRender,
  customDispatch = dispatchEvent,
  mouseKeyBinding = false,
}: Partial<RenderConfig> = {}) {
  // Create default render function if not provided
  if (!customRender) {
    const stats = createRenderStats()
    const fpsListSize = Math.min(maxFpsFrame, MAX_FPS_LIST_SIZE)
    const frameDuration = 1000 / fps

    function executeRender() {
      stats.lastRender = Date.now()
      clearTimeout(stats.renderHandle)
      stats.renderHandle = 0
      stats.frame++

      const startTime = Date.now()
      renderNode()
      const renderTime = Date.now() - startTime

      // Update stats
      stats.max = Math.max(stats.max, renderTime)

      // Maintain fixed-size FPS list
      if (stats.fpsList.length >= fpsListSize) {
        stats.fpsList.shift()
      }
      stats.fpsList.push(renderTime)

      if (showFps) {
        const avg =
          stats.fpsList.reduce((a, b) => a + b, 0) / stats.fpsList.length
        print("render time(react):", stats.frame, renderTime, stats.max, avg)
      }

      if (frameLimit && stats.frame >= frameLimit) {
        quit()
      }
    }

    customRender = function throttledRender() {
      if (!throttle) {
        executeRender()
        return
      }

      const now = Date.now()
      const timeSinceLastRender = now - stats.lastRender

      if (timeSinceLastRender >= frameDuration) {
        executeRender()
      } else {
        // Schedule render for next frame
        clearTimeout(stats.renderHandle)
        stats.renderHandle = +setTimeout(
          executeRender,
          frameDuration - timeSinceLastRender,
        )
      }
    }
  }
  const reconciler = createCustomReconciler(customRender)

  return (reactNode: React.ReactNode) => {
    // Error handler for container
    const throwError = (e: Error) => {
      throw e
    }

    const container = reconciler.createContainer(
      flex.rootNode,
      0,
      null,
      false,
      null,
      "mpv-easy",
      throwError,
      throwError,
      throwError,
      () => {},
    )

    // Mouse event handling
    let lastMousePos: MousePos = { x: 0, y: 0, hover: false }

    const mousePosCallback = (_: string, value: MousePos) => {
      lastMousePos = value
      if (enableMouseMoveEvent) {
        customDispatch(flex.rootNode, lastMousePos, {
          event: "press",
          is_mouse: true,
          key: "",
          canceled: false,
          scale: 0,
          arg: "",
        })
      }
    }

    observeProperty("mouse-pos", "native", mousePosCallback)

    // Helper to dispatch mouse events
    const createMouseEvent = (
      name: string,
      event: "down" | "up" | "press" = "down",
    ) => {
      customDispatch(flex.rootNode, lastMousePos, {
        key_name: name,
        key: name,
        event,
        is_mouse: true,
        canceled: false,
        scale: 0,
      })
    }

    // Shared key binding options
    const keyBindingOpts = { complex: true, repeatable: true, forced: false }

    // Setup mouse input handling
    // Note: script-message is recommended over KeyBinding to avoid conflicts
    if (mouseKeyBinding) {
      const createKeyHandler = (event: any) =>
        customDispatch(flex.rootNode, lastMousePos, event)

      addKeyBinding(
        "MOUSE_BTN0",
        "MPV_EASY_MOUSE_LEFT",
        createKeyHandler,
        keyBindingOpts,
      )
      addKeyBinding(
        "MOUSE_BTN1",
        "MPV_EASY_MOUSE_MID",
        createKeyHandler,
        keyBindingOpts,
      )
      addKeyBinding(
        "MOUSE_BTN3",
        "MPV_EASY_WHEEL_UP",
        createKeyHandler,
        keyBindingOpts,
      )
      addKeyBinding(
        "MOUSE_BTN4",
        "MPV_EASY_WHEEL_DOWN",
        createKeyHandler,
        keyBindingOpts,
      )
    } else {
      // Use script messages for better compatibility
      registerScriptMessage("mouse-left-click", () => {
        createMouseEvent("MBTN_LEFT", "down")
        createMouseEvent("MBTN_LEFT", "up")
      })
      registerScriptMessage("mouse-mid-click", () => {
        createMouseEvent("MBTN_MID", "down")
        createMouseEvent("MBTN_MID", "up")
      })
      registerScriptMessage("mouse-right-click", () => {
        createMouseEvent("MOUSE_RIGHT", "down")
        createMouseEvent("MOUSE_RIGHT", "up")
      })
      registerScriptMessage("mouse-wheel-up", () =>
        createMouseEvent("WHEEL_UP"),
      )
      registerScriptMessage("mouse-wheel-down", () =>
        createMouseEvent("WHEEL_DOWN"),
      )
    }
    // Root node dimension tracking
    let lastW = 0
    let lastH = 0
    const dim = new PropertyNative("osd-dimensions")

    // Batch attribute updates for better performance
    const initializeRootNode = (w: number, h: number) => {
      const root = flex.rootNode

      // Batch attribute updates
      setAttribute(root, "id", RootName)
      setAttribute(root, "width", w)
      setAttribute(root, "height", h)
      setAttribute(root, "position", "relative")
      setAttribute(root, "color", "#FFFFFF")
      setAttribute(root, "backgroundColor", "#000000FF")
      setAttribute(root, "display", "flex")
      setAttribute(root, "padding", 0)
      setAttribute(root, "borderSize", 0)
      setAttribute(root, "x", 0)
      setAttribute(root, "y", 0)
      setAttribute(root, "zIndex", 0)
      setAttribute(root, "fontSize", 16)

      // Batch layout updates
      setLayoutNode(root, "x", 0)
      setLayoutNode(root, "y", 0)
      setLayoutNode(root, "width", w)
      setLayoutNode(root, "height", h)
      setLayoutNode(root, "padding", 0)
      setLayoutNode(root, "border", 0)
    }

    function updateRootNode() {
      const { w, h } = dim.value || { w: 0, h: 0 }

      // Skip if dimensions unchanged or invalid
      if (!w || !h || (lastW === w && lastH === h)) {
        return
      }

      lastW = w
      lastH = h
      initializeRootNode(w, h)
      reconciler.updateContainer(reactNode, container, null, null)
    }

    const dimCallback = dim.observe(updateRootNode)

    // Return cleanup function
    return () => {
      try {
        dim.unobserve(dimCallback)
        mp.unobserve_property(mousePosCallback)
      } catch {
        // Silently ignore cleanup errors
      }
    }
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
