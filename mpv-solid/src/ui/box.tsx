import type { MpDom } from "../render"

export const Box = (
  props: Partial<MpDom["attributes"]> & {
    children?: any
  },
) => {
  // @ts-ignore
  return props.display !== "none" && <mpv-box {...props} />
}
