const YoutubeRegex =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export function isYoutube(s: string): boolean {
  return YoutubeRegex.test(s)
}
