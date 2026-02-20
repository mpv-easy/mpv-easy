import {
  convertImageAsync,
  wgetAsync,
  existsSync,
  fileInfo,
} from "@mpv-easy/tool"
import type { ImageSize } from "@mpv-easy/tool"

export type ThumbnailResult = ImageSize & {
  path: string
}

export async function downloadThumbnail(
  url: string,
  outputPath: string,
): Promise<boolean> {
  // Skip download if file already exists
  if (existsSync(outputPath)) {
    print(`[youtube] thumbnail already exists, skip download: ${outputPath}`)
    return true
  }
  try {
    print(`[youtube] downloading thumbnail: ${url} -> ${outputPath}`)
    await wgetAsync(url, outputPath)
    print(`[youtube] download done: ${outputPath}`)
    return true
  } catch (e) {
    print(`[youtube] download failed: ${url} error: ${e}`)
    return false
  }
}

function getSizeFromBgraFile(
  bgraPath: string,
  expectedWidth?: number,
  expectedHeight?: number,
): ImageSize | undefined {
  // BGRA = 4 bytes per pixel, so totalPixels = fileSize / 4
  // If we have expected dimensions, validate them
  const info = fileInfo(bgraPath)
  if (!info) return undefined
  const fileSize = info.size
  const totalPixels = fileSize / 4
  if (
    expectedWidth &&
    expectedHeight &&
    expectedWidth * expectedHeight === totalPixels
  ) {
    return { width: expectedWidth, height: expectedHeight }
  }
  // Cannot determine both width and height from file size alone
  return undefined
}

export async function downloadAndConvertThumbnail(
  url: string,
  tmpPath: string,
  bgraPath: string,
  expectedWidth?: number,
  expectedHeight?: number,
): Promise<ThumbnailResult | null> {
  try {
    // Skip convert if bgra file already exists
    if (existsSync(bgraPath)) {
      print(`[youtube] bgra already exists, skip convert: ${bgraPath}`)
      const size = getSizeFromBgraFile(bgraPath, expectedWidth, expectedHeight)
      if (size) {
        return { path: bgraPath, width: size.width, height: size.height }
      }
      // Cannot determine size from cache, need to reconvert
    }

    const ok = await downloadThumbnail(url, tmpPath)
    if (!ok) {
      print(`[youtube] download failed, skip convert: ${url}`)
      return null
    }
    print(`[youtube] converting: ${tmpPath} -> ${bgraPath}`)
    const size = await convertImageAsync(tmpPath, bgraPath)
    if (size) {
      print(
        `[youtube] convert done: ${bgraPath} (${size.width}x${size.height})`,
      )
      return { path: bgraPath, width: size.width, height: size.height }
    }
    // Fallback: img command didn't return dimensions (old binary)
    if (expectedWidth && expectedHeight) {
      print(
        `[youtube] convert done (using expected size): ${bgraPath} (${expectedWidth}x${expectedHeight})`,
      )
      return { path: bgraPath, width: expectedWidth, height: expectedHeight }
    }
    print(`[youtube] convert done but no dimensions available: ${bgraPath}`)
    return null
  } catch (e) {
    print(`[youtube] convert failed: ${tmpPath} error: ${e}`)
    return null
  }
}
