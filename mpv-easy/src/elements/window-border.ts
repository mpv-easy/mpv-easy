// @ts-nocheck
import { Element } from "./element"

export class WindowBorder extends Element {
  constructor() {
    super("window_border", { render_order: 9999 })
    this.size = 0
    this.decideEnabled()
  }

  new() {
    return new WindowBorder()
  }

  decideEnabled() {
    this.enabled =
      options.window_border_size > 0 &&
      !state.fullormaxed &&
      !state.border &&
      (state.platform !== "windows" || state.title_bar !== true)
    this.size = this.enabled
      ? Math.round(options.window_border_size * state.scale)
      : 0
  }

  on_prop_border() {
    this.decideEnabled()
  }

  on_prop_title_bar() {
    this.decideEnabled()
  }

  on_prop_fullormaxed() {
    this.decideEnabled()
  }

  on_options() {
    this.decideEnabled()
  }

  render() {
    if (this.size > 0) {
      const ass = assdraw.ass_new()
      const clip = `\\iclip(${this.size},${this.size},${
        display.width - this.size
      },${display.height - this.size})`
      ass.rect(0, 0, display.width + 1, display.height + 1, {
        color: bg,
        clip: clip,
        opacity: config.opacity.border,
      })
      return ass
    }
  }
}
