import type { MpDom } from "@mpv-easy/flex"

export const Box = (
  props: Partial<MpDom["attributes"]> & {
    children?: any
    key?: string | number
  },
) => {
  // @ts-ignore
  return props.display !== "none" && <mpv-box {...props} />
}
