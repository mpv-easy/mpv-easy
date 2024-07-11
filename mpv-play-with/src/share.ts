export function openMpv(urlList: string[]) {
  for (const i of urlList) {
    const a = document.createElement("a")
    a.href = `mpv://${i}`
    a.click()
  }
}
