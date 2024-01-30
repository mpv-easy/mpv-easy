// @ts-nocheck
import { Element } from "./element"
import { Elements } from "./elements"

export class BufferingIndicator extends Element {
  constructor() {
    super("buffer_indicator", { ignores_curtain: true, render_order: 2 })
    this.enabled = false
    this.decide_enabled()
  }

  new() {
    return new BufferingIndicator()
  }

  init() {
    super.init("buffer_indicator", { ignores_curtain: true, render_order: 2 })
    this.enabled = false
    this.decide_enabled()
  }

  decide_enabled() {
    const cache =
      state.cache_underrun ||
      (state.cache_buffering && state.cache_buffering < 100)
    const player = state.core_idle && !state.eof_reached

    if (this.enabled) {
      if (!player || (state.pause && !cache)) {
        this.enabled = false
      }
    } else if (player && cache && state.uncached_ranges) {
      this.enabled = true
    }
  }

  on_prop_pause() {
    this.decide_enabled()
  }

  on_prop_core_idle() {
    this.decide_enabled()
  }

  on_prop_eof_reached() {
    this.decide_enabled()
  }

  on_prop_uncached_ranges() {
    this.decide_enabled()
  }

  on_prop_cache_buffering() {
    this.decide_enabled()
  }

  on_prop_cache_underrun() {
    this.decide_enabled()
  }

  render() {
    const ass = assdraw.ass_new()
    ass.rect(0, 0, display.width, display.height, {
      color: bg,
      opacity: config.opacity.buffering_indicator,
    })
    const size = Math.round(30 + Math.min(display.width, display.height) / 10)
    const opacity = Elements.menu?.is_alive() ? 0.3 : 0.8
    ass.spinner(display.width / 2, display.height / 2, size, {
      color: fg,
      opacity: opacity,
    })
    return ass
  }
}

module.exports = BufferingIndicator
