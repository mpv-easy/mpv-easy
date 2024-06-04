import { renderCounter } from "./counter"
import { renderExample } from "./example"
import { renderMpvEasy } from "./mpv-easy"
import { renderSnake } from "./snake"

// import "@mpv-easy/mpv-easy"

globalThis.setTimeout(() => {
  // renderCounter()
  // renderSnake()
  renderMpvEasy()
  // renderExample()
  // renderCounter()
}, 1000)
