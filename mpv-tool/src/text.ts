// import { Rect } from "./common"
// import { Overlay } from "./mpv"

// let __measureOverlay: Overlay
// export function measureText(node: DOMElement): Rect {
//   const { color = "FFFFFF", text = "" } = node.attributes
//   const font = readAttr(node, "font") || ""
//   const fontSize = readAttr(node, "fontSize") || 16
//   if (!__measureOverlay) {
//     __measureOverlay = new Overlay({
//       computeBounds: true,
//       hidden: true,
//     })
//   }

//   __measureOverlay.data = new AssDraw()
//     .pos(0, 0)
//     .font(font)
//     .fontSize(fontSize)
//     .color(color)
//     .append(text)
//     .toString();

//   return __measureOverlay.update()
// }
