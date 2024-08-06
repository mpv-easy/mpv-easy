import type { TDom } from "@r-tui/solid"

export const Box = (
  props: Partial<TDom["attributes"]> & {
    children?: any
  },
) => {
  // @ts-ignore
  return props.display !== "none" && <tui-box {...props} />
}
