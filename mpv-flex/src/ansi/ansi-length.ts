// https://github.com/sindresorhus/string-length/blob/main/index.js
import { stripAnsi } from "./strip-ansi"

// TODO: support Intl
// const segmenter = new Intl.Segmenter();

export function stringLength(
  string: string,
  { countAnsiEscapeCodes = false } = {},
) {
  if (string === "") {
    return 0
  }

  if (!countAnsiEscapeCodes) {
    string = stripAnsi(string)
    // if (string === '') {
    //   return 0;
    // }
  }

  // let length = 0;
  // for (const _ of segmenter.segment(string)) { // eslint-disable-line no-unused-vars
  //   length++;
  // }
  // return length;

  return string.length
}
