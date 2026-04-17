import { Rule } from "../type"
import { stripAllQueryParams } from "../utils"

/**
 * Default fallback rule — strips the entire query string from any HTTP(S)
 * URL that was not handled by a site-specific rule.
 *
 * This rule is placed last in the rules list so site-specific rules always
 * take priority.
 */
export const Default: Rule = {
  name: "Default",
  match: (url) => /^https?:\/\//i.test(url),
  clean: (url) => stripAllQueryParams(url),
}
