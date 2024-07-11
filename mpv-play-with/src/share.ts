export function openMpv(urlList: string[]) {
  for (const i of urlList) {
    const a = document.createElement("a")
    const href = `mpv://%22${encodeURIComponent(i)}%22`
    a.href = href
    a.click()
  }
}
