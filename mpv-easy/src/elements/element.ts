// @ts-nocheck

import { Elements } from "./elements"

const options = mp.options

export class Element {
  id: string
  render_order: number
  enabled: boolean
  ax: number
  ay: number
  bx: number
  by: number
  proximity: number
  proximity_raw: number
  // 0-1
  min_visibility: number
  // 0-1
  ignores_curtain: boolean
  anchor_id: string
  forced_visibility: number
  _disposers: any
  _flash_out_timer: number
  constructor(id: string, props: any = {}) {
    this.id = id
    this.render_order = 1
    this.enabled = true
    this.ax = 0
    this.ay = 0
    this.bx = 0
    this.by = 0
    this.proximity = 0
    this.proximity_raw = Number.POSITIVE_INFINITY
    this.min_visibility = 0
    this.forced_visibility = 0
    this.ignores_curtain = false
    this.anchor_id = ""
    this._disposers = []

    if (props) {
      Object.assign(this, props)
    }

    this._flash_out_timer = setTimeout(options.flash_duration / 1000, () => {
      const getTo = () => this.proximity
      const onTweenEnd = () => (this.forced_visibility = null)

      if (this.enabled) {
        this.tween_property("forced_visibility", 1, getTo, onTweenEnd)
      } else {
        onTweenEnd()
      }
    })
    this._flash_out_timer.kill()

    Elements.add(this)
  }

  destroy() {
    for (const disposer of this._disposers) {
      disposer()
    }
    this.destroyed = true
    Elements.remove(this)
  }

  reset_proximity() {
    this.proximity = 0
    this.proximity_raw = Number.POSITIVE_INFINITY
  }

  set_coordinates(ax, ay, bx, by) {
    this.ax = ax
    this.ay = ay
    this.bx = bx
    this.by = by
    Elements.update_proximities()
    this.maybe("on_coordinates")
  }

  update_proximity() {
    if (cursor.hidden) {
      this.reset_proximity()
    } else {
      const range = options.proximity_out - options.proximity_in
      this.proximity_raw = get_point_to_rectangle_proximity(cursor, this)
      this.proximity =
        1 - clamp(0, this.proximity_raw - options.proximity_in, range) / range
    }
  }

  is_persistent() {
    const persist = config[`${this.id}_persistency`]
    return (
      persist &&
      ((persist.audio && state.is_audio) ||
        (persist.paused &&
          state.pause &&
          (!Elements.timeline ||
            !Elements.timeline.pressed ||
            Elements.timeline.pressed.pause)) ||
        (persist.video && state.is_video) ||
        (persist.image && state.is_image) ||
        (persist.idle && state.is_idle) ||
        (persist.windowed && !state.fullormaxed) ||
        (persist.fullscreen && state.fullormaxed))
    )
  }

  get_visibility() {
    const min_order =
      Elements.curtain.opacity > 0 && !this.ignores_curtain
        ? Elements.curtain.render_order
        : 0
    if (this.render_order < min_order) return 0

    if (this.is_persistent()) return 1

    if (this.forced_visibility !== null)
      return Math.max(this.forced_visibility, this.min_visibility)

    const anchor = this.anchor_id ? Elements[this.anchor_id] : null
    const anchor_visibility = anchor ? anchor.get_visibility() : 0

    return anchor_visibility === -1
      ? 0
      : Math.max(this.proximity, anchor_visibility, this.min_visibility)
  }

  maybe(name, ...args) {
    if (this[name]) return this[name](...args)
  }

  tween(from, to, setter, duration_or_callback, callback) {
    this.tween_stop()
    this._kill_tween =
      this.enabled &&
      tween(from, to, setter, duration_or_callback, () => {
        this._kill_tween = null
        if (callback) callback()
      })
  }

  is_tweening() {
    return !!this._kill_tween
  }

  tween_stop() {
    this.maybe("_kill_tween")
  }

  tween_property(prop, from, to, duration_or_callback, callback) {
    this.tween(
      from,
      to,
      (value) => (this[prop] = value),
      duration_or_callback,
      callback,
    )
  }

  trigger(name, ...args) {
    const result = this.maybe(`on_${name}`, ...args)
    request_render()
    return result
  }

  flash() {
    if (
      this.enabled &&
      options.flash_duration > 0 &&
      (this.proximity < 1 || this._flash_out_timer.is_enabled())
    ) {
      this.tween_stop()
      this.forced_visibility = 1
      request_render()
      this._flash_out_timer.timeout = options.flash_duration / 1000
      this._flash_out_timer.kill()
      this._flash_out_timer.resume()
    }
  }

  register_disposer(disposer) {
    if (!this._disposers.includes(disposer)) {
      this._disposers.push(disposer)
    }
  }

  register_mp_event(event, callback) {
    mp.register_event(event, callback)
    this.register_disposer(() => mp.unregister_event(callback))
  }

  observe_mp_property(name, callback) {
    mp.observe_property(name, "native", callback)
    this.register_disposer(() => mp.unobserve_property(callback))
  }
}
