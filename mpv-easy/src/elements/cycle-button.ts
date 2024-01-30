// @ts-nocheck
import { Button } from "./button"
export class CycleButton extends Button {
  constructor(id, props) {
    super(id, props)
    this.prop = props.prop
    this.states = props.states
    this.icon = this.states[0].icon
    this.active = this.states[0].active
    this.current_state_index = 0
    this.on_click = () => {
      const new_state =
        this.states[this.current_state_index + 1] || this.states[0]
      const new_value = new_state.value
      if (this.owner) {
        mp.commandv(
          "script-message-to",
          this.owner,
          "set",
          this.prop,
          new_value,
        )
      } else if (["shuffle"].includes(this.prop)) {
        if (["yes", "no"].includes(new_value)) {
          mp.set_property(this.prop, new_value === "yes")
        } else {
          mp.set_property(this.prop, new_value)
        }
      } else {
        mp.set_property(this.prop, new_value)
      }
    }

    const handle_change = (name, value) => {
      value =
        typeof value === "boolean"
          ? value
            ? "yes"
            : "no"
          : String(value || "")
      const index = this.states.findIndex((state) => state.value === value)
      this.current_state_index = index !== -1 ? index : 0
      this.icon = this.states[this.current_state_index].icon
      this.active = this.states[this.current_state_index].active
      request_render()
    }

    const prop_parts = this.prop.split("@")
    if (prop_parts.length === 2) {
      this.prop = prop_parts[0]
      this.owner = prop_parts[1]
      this[`on_external_prop_${this.prop}`] = (_, value) =>
        handle_change(this.prop, value)
      handle_change(this.prop, external[this.prop])
    } else if (["shuffle"].includes(this.prop)) {
      this[`on_prop_${this.prop}`] = (_, value) =>
        handle_change(this.prop, value)
      handle_change(this.prop, state[this.prop])
    } else {
      this.observe_mp_property(this.prop, handle_change)
      handle_change(this.prop, mp.get_property_native(this.prop))
    }
  }

  new(id, props) {
    return new CycleButton(id, props)
  }
}
