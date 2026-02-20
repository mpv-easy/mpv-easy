import { KeyEvent, OsdOverlay, type Overlay } from "@mpv-easy/tool"
import { type BaseDom, LayoutNode, type BaseMouseEvent } from "@mpv-easy/flex"

export const TextName = "@mpv-easy/text"
export const RootName = "@mpv-easy/root"
export const BoxName = "@mpv-easy/box"

export interface MpAttrs {
  title: string
  backgroundImageFormat: "rgba" | "bgra"
  backgroundImage: string
  imageWidth: number
  imageHeight: number
  backgroundColor: string
  color: string
  hide: boolean
  maxWidth: number
  fontWeight: "bold" | "normal"
}

export interface MpProps {
  nodeName: string
  osdOverlays: OsdOverlay[]
  imageOverlay?: Overlay
}

export interface MpEvent extends KeyEvent {}

export interface MpDom extends BaseDom<MpAttrs, MpProps, MpEvent> {}

export type MpDomProps = MpDom["attributes"]

export type MouseEvent = BaseMouseEvent<MpAttrs, MpProps, MpEvent>

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
    dirty: true,
  }

  return node
}
