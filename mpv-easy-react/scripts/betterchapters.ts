import {
  add,
  getPropertyNumber,
  playlistNext,
  playlistPrev,
  registerScriptMessage,
} from "@mpv-easy/tool"

// https://github.com/mpv-player/mpv/issues/4738#issuecomment-321298846
function chapterSeek(direction: number) {
  const chapters = getPropertyNumber("chapters")
  const chapter = getPropertyNumber("chapter")
  if (chapters === undefined || chapter === undefined) {
    return
  }
  const target = chapter + direction
  if (target < 0) {
    playlistPrev()
  } else if (target >= chapters) {
    playlistNext()
  } else {
    add("chapter", direction)
  }
}
registerScriptMessage("chapter-next", () => {
  chapterSeek(1)
})
registerScriptMessage("chapter-prev", () => {
  chapterSeek(-1)
})
