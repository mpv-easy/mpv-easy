import { createMpvMock } from "@mpv-easy/canvas"

const canvas = document.createElement("canvas")

globalThis.mp = createMpvMock(canvas, 1920, 720, 30)
globalThis.print = console.log
console.log(mp)

// Theme toggle functionality
function createThemeToggle() {
  const toggle = document.createElement("button")
  toggle.className = "theme-toggle"
  toggle.id = "theme-toggle"

  const isDark =
    document.documentElement.getAttribute("data-theme") === "dark" ||
    (!document.documentElement.hasAttribute("data-theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  toggle.textContent = isDark ? "☀️" : "🌙"

  toggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme =
      currentTheme === "dark" ||
      (!currentTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "light"
        : "dark"
    document.documentElement.setAttribute("data-theme", newTheme)
    toggle.textContent = newTheme === "dark" ? "☀️" : "🌙"
  })

  document.body.appendChild(toggle)
}

// Create theme toggle after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createThemeToggle)
} else {
  createThemeToggle()
}
