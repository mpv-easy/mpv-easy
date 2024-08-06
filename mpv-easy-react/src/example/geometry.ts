import { getGeometry, setGeometry, addKeyBinding } from "@mpv-easy/tool"

let size = 500
let x = 500
let y = 500

function update() {
  setGeometry(size, size, x, y)
}

update()

addKeyBinding("w", "w", () => {
  y = getGeometry().y - 50
  update()
})

addKeyBinding("s", "s", () => {
  y = getGeometry().y + 50
  update()
})
addKeyBinding("a", "a", () => {
  x = getGeometry().x - 50
  update()
})
addKeyBinding("d", "d", () => {
  x = getGeometry().x + 50
  update()
})
addKeyBinding("q", "q", () => {
  size = getGeometry().w - 50
  update()
})
addKeyBinding("e", "e", () => {
  size = getGeometry().w + 50
  update()
})
