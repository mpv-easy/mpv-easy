import { createMpvMock } from "@mpv-easy/canvas"

const canvas = document.createElement("canvas")

globalThis.mp = createMpvMock(canvas, 1920, 720, 30)
globalThis.print = console.log
console.log(mp)
