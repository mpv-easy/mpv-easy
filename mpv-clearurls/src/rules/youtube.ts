import { Rule } from "../type"
import { removeQueryParams } from "../utils"

/**
 * YouTube tracking / attribution parameters to remove.
 *
 * Essential params like `v` (video ID), `list` (playlist ID), `t` (timestamp),
 * and `index` are intentionally preserved.
 */
const TRACKING_PARAMS = [
  "si",
  "feature",
  "pp",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
]

export const Youtube: Rule = {
  name: "YouTube",
  match: (url) =>
    /^https?:\/\/(?:www\.)?youtube\.com\//i.test(url) ||
    /^https?:\/\/youtu\.be\//i.test(url),
  clean: (url) => removeQueryParams(url, TRACKING_PARAMS),
}
