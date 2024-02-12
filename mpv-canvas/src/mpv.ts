export class Mpv {
  get_script_file() {
    return "get_script_file"
  }
}

declare module global {
  var mp: Mpv
}
