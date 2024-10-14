import { useEffect, useLayoutEffect } from "react"

declare namespace globalThis {
  // biome-ignore lint/style/noVar: <explanation>
  var window: any
}

export const isWindowDefined = typeof globalThis.window !== "undefined"
export const IS_SERVER = !isWindowDefined || "Deno" in globalThis
export const useIsomorphicLayoutEffect = IS_SERVER ? useEffect : useLayoutEffect
