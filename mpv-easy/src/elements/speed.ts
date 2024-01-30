// @ts-nocheck

import { Element } from "./element"

export class Speed extends Element {
  constructor(props) {
    super("speed", props)

    this.width = 0
    this.height = 0
    this.notches = 10
    this.notch_every = 0.1
    this.notch_spacing = null
    this.font_size = null
    this.dragging = null
  }

  new(props) {
    return new Speed(props)
  }

  init(props) {
    super.init(props)
  }

  on_coordinates() {
    this.height = this.by - this.ay
    this.width = this.bx - this.ax
    this.notch_spacing = this.width / (this.notches + 1)
    this.font_size = Math.round(this.height * 0.48 * options.font_scale)
  }

  on_options() {
    this.on_coordinates()
  }

  speed_step(speed, up) {
    if (options.speed_step_is_factor) {
      return up ? speed * options.speed_step : speed * (1 / options.speed_step)
    }
    return up ? speed + options.speed_step : speed - options.speed_step
  }

  handle_cursor_down() {
    this.tween_stop()
    this.dragging = {
      start_time: mp.get_time(),
      start_x: cursor.x,
      distance: 0,
      speed_distance: 0,
      start_speed: state.speed,
    }
  }

  on_global_mouse_move() {
    if (!this.dragging) return

    this.dragging.distance = cursor.x - this.dragging.start_x
    this.dragging.speed_distance =
      (-this.dragging.distance / this.notch_spacing) * this.notch_every

    const speed_current = state.speed
    let speed_drag_current =
      this.dragging.start_speed + this.dragging.speed_distance
    speed_drag_current = Math.min(Math.max(0.01, speed_drag_current), 100)
    const drag_dir_up = speed_drag_current > speed_current

    let speed_step_next = speed_current
    const speed_drag_diff = Math.abs(speed_drag_current - speed_current)

    while (Math.abs(speed_step_next - speed_current) < speed_drag_diff) {
      speed_step_next = this.speed_step(speed_step_next, drag_dir_up)
    }

    const speed_step_prev = this.speed_step(speed_step_next, !drag_dir_up)
    let speed_new = speed_step_prev
    const speed_next_diff = Math.abs(speed_drag_current - speed_step_next)
    const speed_prev_diff = Math.abs(speed_drag_current - speed_step_prev)

    if (speed_next_diff < speed_prev_diff) {
      speed_new = speed_step_next
    }

    if (speed_new !== speed_current) {
      mp.set_property_native("speed", speed_new)
    }
  }

  handle_cursor_up() {
    this.dragging = null
    request_render()
  }

  on_global_mouse_leave() {
    this.dragging = null
    request_render()
  }

  handle_wheel_up() {
    mp.set_property_native("speed", this.speed_step(state.speed, true))
  }

  handle_wheel_down() {
    mp.set_property_native("speed", this.speed_step(state.speed, false))
  }

  render() {
    const visibility = this.get_visibility()
    const opacity = this.dragging ? 1 : visibility

    if (opacity <= 0) return

    cursor.zone("primary_down", this, () => {
      this.handle_cursor_down()
      cursor.once("primary_up", () => this.handle_cursor_up())
    })

    cursor.zone("secondary_down", this, () => {
      mp.set_property_native("speed", 1)
    })

    cursor.zone("wheel_down", this, () => {
      this.handle_wheel_down()
    })

    cursor.zone("wheel_up", this, () => {
      this.handle_wheel_up()
    })

    const ass = assdraw.ass_new()

    // Background
    ass.rect(this.ax, this.ay, this.bx, this.by, {
      color: bg,
      radius: state.radius,
      opacity: opacity * config.opacity.speed,
    })

    // ... (omitted for brevity)

    return ass
  }
}
