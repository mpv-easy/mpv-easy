import { Rule } from "../type"
import { removeQueryParams } from "../utils"

/**
 * Bilibili tracking parameters to remove.
 *
 * Essential params like `p` (page/part number) and `t` (timestamp) are
 * intentionally preserved.
 */
const TRACKING_PARAMS = [
  "spm_id_from",
  "vd_source",
  "from_spmid",
  "from",
  "seid",
  "share_source",
  "share_medium",
  "share_plat",
  "share_session_id",
  "share_tag",
  "unique_k",
  "is_story_h5",
  "bbid",
  "ts",
  "mid",
  "csource",
  "buvid",
  "from_source",
  "plat_id",
  "share_from",
  "msource",
]

export const Bilibili: Rule = {
  name: "Bilibili",
  match: (url) => /^https?:\/\/(?:www\.)?bilibili\.com\//i.test(url),
  clean: (url) => removeQueryParams(url, TRACKING_PARAMS),
}
