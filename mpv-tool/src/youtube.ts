export const YoutubeRegex =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

export const MainPageReg = /^(?:https?:\/\/)(.*?)\.youtube\.(.*?)\/?$/

export const MyVideosReg =
  /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/@(.*?)\/videos\/?/

export const ListReg =
  /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/watch\?v=(.*?)&list=(.*?)/

export const VideoReg = /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/watch\?v=(.*?)/

export const ResultReg =
  /^(?:https?:\/\/)(.*?).youtube\.(.*?)\/results\?search_query=(.*?)/

export function isYoutube(s: string): boolean {
  return [
    YoutubeRegex,
    MainPageReg,
    MyVideosReg,
    ListReg,
    VideoReg,
    ResultReg,
  ].some((i) => i.test(s))
}
