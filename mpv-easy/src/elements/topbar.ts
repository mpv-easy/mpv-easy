// @ts-nocheck
import { command } from "@mpv-easy/tool"
import { Element } from "./element"
export class TopBarButton extends Element {
  constructor(id, props) {
    super(id, props)
    this.anchor_id = "top_bar"
    this.icon = props.icon
    this.background = props.background
    this.command = props.command
  }

  new(id, props) {
    return new TopBarButton(id, props)
  }

  handleCursorDown() {
    mp.command(
      typeof this.command === "function" ? this.command() : this.command,
    )
  }

  render() {
    const visibility = this.getVisibility()
    if (visibility <= 0) return
    const ass = assdraw.ass_new()

    if (this.proximity_raw === 0) {
      ass.rect(this.ax, this.ay, this.bx, this.by, {
        color: this.background,
        opacity: visibility,
      })
    }

    cursor.zone("primary_down", this, () => this.handleCursorDown())

    const width = this.bx - this.ax
    const height = this.by - this.ay
    const iconSize = Math.min(width, height) * 0.5

    ass.icon(this.ax + width / 2, this.ay + height / 2, iconSize, this.icon, {
      opacity: visibility,
      border: options.text_border * state.scale,
    })

    return ass
  }
}

class TopBar extends Element {
  constructor() {
    super("top_bar", { render_order: 4 })
    this.size = 0
    this.icon_size = 1
    this.spacing = 1
    this.font_size = 1
    this.title_bx = 1
    this.title_by = 1
    this.show_alt_title = false
    this.main_title = null
    this.alt_title = null

    this.buttons = [
      new TopBarButton("tb_close", {
        icon: "close",
        background: "2311e8",
        command: "quit",
        render_order: this.render_order,
      }),
      new TopBarButton("tb_max", {
        icon: "crop_square",
        background: "222222",
        command: () =>
          state.border
            ? state.fullscreen
              ? "set fullscreen no;cycle window-maximized"
              : "cycle window-maximized"
            : "set window-maximized no;cycle fullscreen",
        render_order: this.render_order,
      }),
      new TopBarButton("tb_min", {
        icon: "minimize",
        background: "222222",
        command: "cycle window-minimized",
        render_order: this.render_order,
      }),
    ]

    this.decideTitles()
  }

  new() {
    return new TopBar()
  }

  destroy() {
    this.buttons.forEach((button) => button.destroy())
    super.destroy()
  }

  decideEnabled() {
    // Implementation for decideEnabled function
    // Variables such as options, state, etc. need to be defined or replaced accordingly in your JavaScript environment
  }

  decideTitles() {
    // Implementation for decideTitles function
    // Variables such as state, options, etc. need to be defined or replaced accordingly in your JavaScript environment
  }

  updateDimensions() {
    // Implementation for updateDimensions function
    // Variables such as display, Elements, options, state, etc. need to be defined or replaced accordingly in your JavaScript environment
  }

  toggleTitle() {
    if (options.top_bar_alt_title_place !== "toggle") return
    this.show_alt_title = !this.show_alt_title
  }

  render() {
    const visibility = this.getVisibility()
    if (visibility <= 0) return
    const ass = assdraw.ass_new()

    // Implementation for rendering the TopBar in JavaScript
    // Variables such as state, options, display, cursor, text_width, Elements, config, etc. need to be defined or replaced accordingly in your JavaScript environment

    return ass
  }
}
