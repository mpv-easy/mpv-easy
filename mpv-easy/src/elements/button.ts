// @ts-nocheck

import { Element } from "./element"

export class Button extends Element {
  constructor(id, props) {
    super(id, props)
    this.icon = props.icon
    this.active = props.active
    this.tooltip = props.tooltip
    this.badge = props.badge
    this.foreground = props.foreground || fg
    this.background = props.background || bg
    this.on_click = props.on_click
  }

  new(id, props) {
    return new Button(id, props)
  }

  init(id, props) {
    this.icon = props.icon
    this.active = props.active
    this.tooltip = props.tooltip
    this.badge = props.badge
    this.foreground = props.foreground || fg
    this.background = props.background || bg
    this.on_click = props.on_click
    super.init(id, props)
  }

  on_coordinates() {
    this.font_size = Math.round((this.by - this.ay) * 0.7)
  }

  handle_cursor_down() {
    mp.add_timeout(0.01, this.on_click)
  }

  render() {
    const visibility = this.get_visibility()
    if (visibility <= 0) return

    cursor.zone("primary_down", this, () => this.handle_cursor_down())

    const ass = assdraw.ass_new()
    const is_hover = this.proximity_raw === 0
    const is_hover_or_active = is_hover || this.active
    const foreground = this.active ? this.background : this.foreground
    const background = this.active ? this.foreground : this.background

    if (is_hover_or_active) {
      ass.rect(this.ax, this.ay, this.bx, this.by, {
        color: this.active ? background : foreground,
        radius: state.radius,
        opacity: visibility * (this.active ? 1 : 0.3),
      })
    }

    if (is_hover && this.tooltip) {
      ass.tooltip(this, this.tooltip)
    }

    let icon_clip
    if (this.badge) {
      const badge_font_size = this.font_size * 0.6
      const badge_opts = {
        size: badge_font_size,
        color: background,
        opacity: visibility,
      }
      const badge_width = text_width(this.badge, badge_opts)
      const width = Math.ceil(badge_width + (badge_font_size / 7) * 2)
      const height = Math.ceil(badge_font_size * 0.93)
      const bx = this.bx - 1
      const by = this.by - 1

      ass.rect(bx - width, by - height, bx, by, {
        color: foreground,
        radius: state.radius,
        opacity: visibility,
        border: this.active ? 0 : 1,
        border_color: background,
      })

      ass.txt(bx - width / 2, by - height / 2, 5, this.badge, badge_opts)

      const clip_border = Math.max(this.font_size / 20, 1)
      const clip_path = assdraw.ass_new()
      clip_path.round_rect_cw(
        Math.floor(bx - width - clip_border),
        Math.floor(by - height - clip_border),
        bx,
        by,
        3,
      )

      icon_clip = `\\iclip(${clip_path.scale}, ${clip_path.text})`
    }

    const x = Math.round(this.ax + (this.bx - this.ax) / 2)
    const y = Math.round(this.ay + (this.by - this.ay) / 2)

    ass.icon(x, y, this.font_size, this.icon, {
      color: foreground,
      border: this.active ? 0 : options.text_border * state.scale,
      border_color: background,
      opacity: visibility,
      clip: icon_clip,
    })

    return ass
  }
}
