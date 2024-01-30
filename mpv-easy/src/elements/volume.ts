// @ts-nocheck

import { Element } from "./element"
import { Elements } from "./elements"

export class VolumeSlider extends Element {
  constructor(props) {
    super("volume_slider", props)
    this.pressed = false
    this.nudge_y = 0
    this.nudge_size = 0
    this.draw_nudge = false
    this.spacing = 0
    this.border_size = 0
    this.updateDimensions()
  }

  new(props) {
    return new VolumeSlider(props)
  }

  updateDimensions() {
    this.border_size = Math.max(
      0,
      Math.round(options.volume_border * state.scale),
    )
  }

  getVisibility() {
    return Elements.volume.getVisibility(this)
  }

  setVolume(volume) {
    volume = Math.round(volume / options.volume_step) * options.volume_step
    if (state.volume === volume) return
    mp.commandv("set", "volume", clamp(0, volume, state.volume_max))
  }

  setFromCursor() {
    const volumeFraction =
      (this.by - cursor.y - this.border_size) /
      (this.by - this.ay - this.border_size)
    this.setVolume(volumeFraction * state.volume_max)
  }

  on_display() {
    this.updateDimensions()
  }

  on_options() {
    this.updateDimensions()
  }

  on_coordinates() {
    if (typeof state.volume_max !== "number" || state.volume_max <= 0) return
    const width = this.bx - this.ax
    this.nudge_y =
      this.by - Math.round((this.by - this.ay) * (100 / state.volume_max))
    this.nudge_size = Math.round(width * 0.18)
    this.draw_nudge = this.ay < this.nudge_y
    this.spacing = Math.round(width * 0.2)
  }

  on_global_mouse_move() {
    if (this.pressed) this.setFromCursor()
  }

  handle_wheel_up() {
    this.setVolume(state.volume + options.volume_step)
  }

  handle_wheel_down() {
    this.setVolume(state.volume - options.volume_step)
  }

  render() {
    // Implementation for rendering the VolumeSlider in JavaScript
    // Note: Variables such as options, state, Elements, cursor, clamp, assdraw, etc., must be defined or replaced with appropriate references in your JavaScript environment.
  }
}

class Volume extends Element {
  constructor() {
    super("volume", { render_order: 7 })
    this.size = 0
    this.mute_ay = 0
    this.slider = new VolumeSlider({
      anchor_id: "volume",
      render_order: this.render_order,
    })
    this.updateDimensions()
  }

  new() {
    return new Volume()
  }

  destroy() {
    this.slider.destroy()
    super.destroy()
  }

  getVisibility() {
    return this.slider.pressed
      ? 1
      : Elements.maybe("timeline", "get_is_hovered")
        ? -1
        : super.getVisibility()
  }

  updateDimensions() {
    // Implementation for updating dimensions in the Volume class
    // Note: Variables such as options, state, Elements, etc., must be defined or replaced with appropriate references in your JavaScript environment.
  }

  render() {
    // Implementation for rendering the Volume element in JavaScript
    // Note: Variables such as options, state, Elements, cursor, clamp, assdraw, etc., must be defined or replaced with appropriate references in your JavaScript environment.
  }
}
