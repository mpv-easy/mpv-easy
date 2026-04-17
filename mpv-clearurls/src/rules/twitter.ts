import { Rule } from "../type"
import { removeQueryParams } from "../utils"

/**
 * Twitter / X tracking parameters to remove.
 */
const TRACKING_PARAMS = ["s", "t", "ref_src", "ref_url"]

export const Twitter: Rule = {
  name: "Twitter",
  match: (url) => /^https?:\/\/(?:www\.)?(twitter|x)\.com\//i.test(url),
  clean: (url) => removeQueryParams(url, TRACKING_PARAMS),
}
