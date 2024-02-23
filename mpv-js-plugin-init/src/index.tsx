// import { renderMpvEasy, } from "./mpv-easy"
// import { renderCounter } from "./counter"
// import { renderExample } from "./example"
// import { renderSnake } from "./snake"

import { renderCounter } from "./counter"
import { renderExample } from "./example"
import { renderMpvEasy } from "./mpv-easy"
import { renderSnake } from "./snake"

// import "@mpv-easy/mpv-easy"

{
  // const log = globalThis.__log
  globalThis.setTimeout(() => {
    // renderCounter()
    // renderSnake()
    renderMpvEasy()
    // renderExample()
    // renderCounter()
  }, 1000)
}
