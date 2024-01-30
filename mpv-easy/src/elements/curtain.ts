// @ts-nocheck
import { Element } from "./element"
export class Curtain extends Element {
  constructor() {
    super("curtain", { render_order: 999 })
    this.opacity = 0
    this.dependents = []
    this.init()
  }

  new() {
    return new Curtain()
  }

  init() {
    super.init("curtain", { render_order: 999 })
    this.opacity = 0
    this.dependents = []
  }

  register(id) {
    this.dependents.push(id)
    if (this.dependents.length === 1) {
      this.tweenProperty("opacity", this.opacity, 1)
    }
  }

  unregister(id) {
    this.dependents = this.dependents.filter((item) => item !== id)
    if (this.dependents.length === 0) {
      this.tweenProperty("opacity", this.opacity, 0)
    }
  }

  render() {
    if (this.opacity === 0 || config.opacity.curtain === 0) {
      return
    }
    const ass = assdraw.ass_new()
    ass.rect(0, 0, display.width, display.height, {
      color: config.color.curtain,
      opacity: config.opacity.curtain * this.opacity,
    })
    return ass
  }
}
