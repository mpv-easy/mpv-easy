import type { MpDom } from "@mpv-easy/flex"

export const Box = (
  props: Partial<MpDom["attributes"]> & {
    children?: any
  },
) => {
  // @ts-ignore
  return props.display !== "none" && <mpv-box {...props} />
}
