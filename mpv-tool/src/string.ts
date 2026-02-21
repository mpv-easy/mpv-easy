export function compareString(a: string, b: string) {
  return a.localeCompare(b)
}

export function textEllipsis(
  text: string,
  maxLength: number,
  ellipsis = "...",
) {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Returns `true` if the character is a narrow (half-width) character.
 * Narrow characters include ASCII printable characters (0x20–0x7E):
 * English letters, digits, punctuation, and space.
 * All other characters (CJK, Korean, emoji, etc.) are considered wide.
 */
function isNarrowChar(char: string): boolean {
  const code = char.charCodeAt(0)
  return code >= 0x20 && code <= 0x7e
}

/**
 * Estimate the rendered width of a single character.
 *
 * @param narrowScale - Width of narrow chars as a fraction of fontSize (default: 0.6)
 * @param wideScale   - Width of wide chars as a fraction of fontSize (default: 1.0)
 */
function estimateCharWidth(
  char: string,
  fontSize: number,
  narrowScale: number,
  wideScale: number,
): number {
  return isNarrowChar(char) ? fontSize * narrowScale : fontSize * wideScale
}

/**
 * Estimate the total rendered width of a string.
 */
function estimateTextWidth(
  text: string,
  fontSize: number,
  narrowScale: number,
  wideScale: number,
): number {
  let width = 0
  for (const char of text) {
    width += estimateCharWidth(char, fontSize, narrowScale, wideScale)
  }
  return width
}

/**
 * Fit a string into a given pixel width, truncating with an ellipsis if needed.
 *
 * Uses a simple heuristic to estimate character widths:
 * - Narrow characters (ASCII 0x20–0x7E): narrowScale × fontSize
 * - Wide characters (CJK, Korean, etc.): wideScale × fontSize
 *
 * Common scale presets:
 * - Monospace fonts (e.g. FiraCode): narrowScale=0.6, wideScale=1.2 (1:2 cell ratio)
 * - Proportional fonts:              narrowScale=0.55, wideScale=1.0
 * - Conservative (avoid overflow):   narrowScale=0.6, wideScale=1.0
 *
 * @param text        - The string to fit.
 * @param maxWidth    - Maximum available width in pixels.
 * @param fontSize    - Font size in pixels.
 * @param ellipsis    - The truncation suffix (default: "...").
 * @param narrowScale - Width ratio for narrow (ASCII) characters (default: 0.6).
 * @param wideScale   - Width ratio for wide (CJK, etc.) characters (default: 1.0).
 * @returns The original string if it fits, otherwise a truncated string
 *          ending with the ellipsis that fits within maxWidth.
 */
export function fitTextToWidth(
  text: string,
  maxWidth: number,
  fontSize: number,
  ellipsis = "...",
  // FIXME: How to accurately measure the display size of a character within the current font size with high performance
  narrowScale = 0.55,
  wideScale = 0.9,
): string {
  const fullWidth = estimateTextWidth(text, fontSize, narrowScale, wideScale)
  if (fullWidth <= maxWidth) {
    return text
  }

  const ellipsisWidth = estimateTextWidth(
    ellipsis,
    fontSize,
    narrowScale,
    wideScale,
  )
  const available = maxWidth - ellipsisWidth
  if (available <= 0) {
    return ellipsis
  }

  let currentWidth = 0
  let end = 0
  const chars = [...text]
  for (let i = 0; i < chars.length; i++) {
    const charWidth = estimateCharWidth(
      chars[i],
      fontSize,
      narrowScale,
      wideScale,
    )
    if (currentWidth + charWidth > available) {
      break
    }
    currentWidth += charWidth
    end = i + 1
  }

  return chars.slice(0, end).join("") + ellipsis
}
