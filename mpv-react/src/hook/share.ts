import { useEffect, useLayoutEffect } from "react"

declare namespace globalThis {
  var window: any
}

export const isWindowDefined = typeof globalThis.window !== "undefined"
export const IS_SERVER = !isWindowDefined || "Deno" in globalThis
export const useIsomorphicLayoutEffect = IS_SERVER ? useEffect : useLayoutEffect
