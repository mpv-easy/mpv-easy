// @ts-nocheck

import { Element } from "./element"
export class Elements {
  _all: Element[]
  constructor() {
    this._all = []
  }

  add(element: Element) {
    if (!element.id) {
      console.error('attempt to add element without "id" property')
      return
    }

    if (this.has(element.id)) {
      this.remove(element.id)
    }

    this._all.push(element)
    this[element.id] = element

    this._all.sort((a, b) => a.render_order - b.render_order)

    request_render()
  }

  remove(idOrElement) {
    if (!idOrElement) return
    const id = typeof idOrElement === "object" ? idOrElement.id : idOrElement
    const element = this[id]
    if (element) {
      if (!element.destroyed) element.destroy()
      element.enabled = false
      this._all = this._all.filter((el) => el !== this[id])
      delete this[id]
      request_render()
    }
  }

  update_proximities() {
    const curtain_render_order =
      Elements.curtain.opacity > 0 ? Elements.curtain.render_order : 0
    const mouse_leave_elements = []
    const mouse_enter_elements = []

    for (const element of this._all) {
      if (element.enabled) {
        const previous_proximity_raw = element.proximity_raw

        if (
          !element.ignores_curtain &&
          element.render_order < curtain_render_order
        ) {
          element.reset_proximity()
        } else {
          element.update_proximity()
        }

        if (element.proximity_raw === 0) {
          if (previous_proximity_raw !== 0) {
            mouse_enter_elements.push(element)
          }
        } else {
          if (previous_proximity_raw === 0) {
            mouse_leave_elements.push(element)
          }
        }
      }
    }

    for (const element of mouse_leave_elements) element.trigger("mouse_leave")
    for (const element of mouse_enter_elements) element.trigger("mouse_enter")
  }

  toggle(ids) {
    const has_invisible = ids.some(
      (id) => Elements[id] && Elements[id].get_visibility() !== 1,
    )
    this.set_min_visibility(has_invisible ? 1 : 0, ids)

    if (!has_invisible) {
      for (const id of ids) {
        if (Elements[id]) Elements[id].reset_proximity()
      }
    }
  }

  set_min_visibility(visibility, ids) {
    for (const id of ids) {
      const element = Elements[id]
      if (element) {
        const from = Math.max(0, element.get_visibility())
        element.tween_property("min_visibility", from, visibility)
      }
    }
  }

  flash(ids) {
    const elements = this._all.filter((element) => ids.includes(element.id))
    for (const element of elements) element.flash()
  }

  trigger(name, ...args) {
    for (const element of this._all) element.trigger(name, ...args)
  }

  proximity_trigger(name, ...args) {
    for (let i = this._all.length - 1; i >= 0; i--) {
      const element = this._all[i]
      if (element.enabled) {
        if (element.proximity_raw === 0) {
          if (element.trigger(name, ...args) === "stop_propagation") break
        }
        if (element.trigger(`global_${name}`, ...args) === "stop_propagation")
          break
      }
    }
  }

  v(id, prop, fallback) {
    if (this[id]?.enabled && this[id][prop] !== undefined) {
      return this[id][prop]
    }
    return fallback
  }

  maybe(id, method, ...args) {
    if (this[id]) return this[id].maybe(method, ...args)
  }

  has(id) {
    return this[id] !== undefined
  }

  *[Symbol.iterator]() {
    yield* this._all
  }
}
