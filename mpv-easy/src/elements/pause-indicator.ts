// @ts-nocheck

import { Element } from "./elements"

export class PauseIndicator extends Element {
  constructor() {
    super("pause_indicator", { render_order: 3 })
    this.ignores_curtain = true
    this.paused = state.pause
    this.fadeout_requested = false
    this.opacity = 0
    this.initOptions()
  }

  new() {
    return new PauseIndicator()
  }

  initOptions() {
    this.base_icon_opacity = options.pause_indicator === "flash" ? 1 : 0.8
    this.type = options.pause_indicator
    this.is_manual = options.pause_indicator === "manual"
  }

  flash() {
    if (!this.is_manual && this.type !== "flash") return

    this.paused = mp.get_property_native("pause")
    if (this.is_manual) this.type = "flash"

    this.opacity = 1
    this.tween_property("opacity", 1, 0, 300)
  }

  decide() {
    if (!this.is_manual && this.type !== "static") return

    this.paused = mp.get_property_native("pause")
    if (this.is_manual) this.type = "static"

    this.opacity = this.paused ? 1 : 0
    request_render()

    mp.add_timeout(0.05, () => {
      osd.update()
    })
  }

  on_prop_pause() {
    if (Elements.v("timeline", "pressed")) return

    if (options.pause_indicator === "flash") {
      if (this.paused === state.pause) return
      this.flash()
    } else if (options.pause_indicator === "static") {
      this.decide()
    }
  }

  on_options() {
    this.initOptions()
    this.on_prop_pause()
    if (this.type === "flash") this.opacity = 0
  }

  render() {
    if (this.opacity === 0) return

    const ass = assdraw.ass_new()
    const is_static = this.type === "static"

    if (is_static) {
      ass.rect(0, 0, display.width, display.height, {
        color: bg,
        opacity: this.opacity * 0.3,
      })
    }

    const size = Math.round(
      Math.min(display.width, display.height) * (is_static ? 0.2 : 0.15),
    )
    const adjustedSize = size + size * (1 - this.opacity)

    if (this.paused) {
      ass.icon(display.width / 2, display.height / 2, adjustedSize, "pause", {
        border: 1,
        opacity: this.base_icon_opacity * this.opacity,
      })
    } else {
      ass.icon(
        display.width / 2,
        display.height / 2,
        adjustedSize * 1.2,
        "play_arrow",
        {
          border: 1,
          opacity: this.base_icon_opacity * this.opacity,
        },
      )
    }

    return ass
  }
}
