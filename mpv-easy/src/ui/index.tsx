import React, { useEffect, useReducer, useRef } from "react"
import { PluginContext, SystemApi } from "@mpv-easy/plugin"
import { useStore } from "../state-store"
import { Uosc } from "./uosc"
import { Osc } from "./osc"
import { Toolbar } from "./toolbar"
import { pluginName } from "../main"
import { AutoHide, Box, DOMElement, Tooltip } from "@mpv-easy/ui"

function computeHide(
  node: DOMElement | null,
  { x, y }: { x: number; y: number },
): boolean {
  if (!node) {
    return true
  }
  if (node.layoutNode.hasPoint(x, y)) {
    return false
  }
  return true
}
export function Easy({
  context,
  api,
}: { context: PluginContext; api: SystemApi }) {
  const { store, dispatch, t } = useStore(context, api)

  const Element = {
    osc: Osc,
    uosc: Uosc,
  }[store[pluginName].name]
  const { mode, style } = store[pluginName]

  const button = style[mode].button.default
  const control = style[mode].control

  const toolbarRef = useRef(null)
  const elementRef = useRef(null)

  const { mousePos } = store[pluginName].player
  const hide =
    computeHide(toolbarRef.current, mousePos) &&
    computeHide(elementRef.current, mousePos)

  return (
    <>
      <Toolbar
        ref={toolbarRef}
        store={store}
        dispatch={dispatch}
        t={t}
        hide={hide}
      />

      <Element
        ref={elementRef}
        store={store}
        dispatch={dispatch}
        t={t}
        hide={hide}
      />

      <Tooltip
        mouseX={store[pluginName].player.mousePos.x}
        mouseY={store[pluginName].player.mousePos.y}
        text={store[pluginName].state.tooltipText}
        hide={store[pluginName].state.tooltipHide || hide}
        backgroundColor={button.backgroundColor}
        font={button.font}
        fontSize={button.fontSize / 1.5}
        color={button.color}
        padding={button.padding}
        display="flex"
        justifyContent="center"
        alignItems="center"
        zIndex={64}
      />
    </>
  )
}
