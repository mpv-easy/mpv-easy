/**
 * A ClearURLs rule describes how to clean tracking parameters from a
 * specific site. Each rule declares a `match` predicate and a `clean`
 * function that returns the sanitised URL.
 */
export interface Rule {
  /** Human-readable name used in log messages. */
  name: string
  /** Return `true` when this rule should process the given URL. */
  match: (url: string) => boolean
  /** Return the cleaned URL, or `undefined` if no cleaning is needed. */
  clean: (url: string) => string | undefined
}
