import { PropertyBool } from "./property"

export type MpvPlayer = {}

export function initMpvPlayer() {
  return {
    props: {
      timePos: new PropertyBool("time-pos"),
    },
    command() {},
  }
}
