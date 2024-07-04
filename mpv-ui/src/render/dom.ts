import { OsdOverlay, type Overlay } from "@mpv-easy/tool"
import {
  type BaseDomProps,
  type BaseDom,
  type EventName,
  LayoutNode,
  type BaseMouseEvent,
} from "@r-tui/flex"

export interface MpAttrs {
  title: string
  backgroundImageFormat: "rgba" | "bgra"
  backgroundImage: string
  backgroundColor: string
  color: string
  hide: boolean
}

export interface MpProps {
  nodeName: string
  osdOverlays: OsdOverlay[]
  imageOverlay?: Overlay
}

export interface MpDom extends BaseDom<MpAttrs, {}, MpProps> { }

export type MpDomProps = MpDom["attributes"]

export type MouseEvent = BaseMouseEvent<BaseDom<MpAttrs, {}, MpProps>>

export const createNode = (
  nodeName: string,
  osdOverlays = [
    new OsdOverlay({ cache: true }),
    new OsdOverlay({ cache: true }),
    new OsdOverlay({ cache: true }),
  ],
): MpDom => {
  const node: MpDom = {
    // nodeName,
    attributes: {},
    childNodes: [],
    parentNode: undefined,
    layoutNode: new LayoutNode(),
    // osdOverlays,
    props: {
      nodeName,
      osdOverlays,
    },
  }

  return node
}
