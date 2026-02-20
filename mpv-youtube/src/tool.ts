import {
  convertImageAsync,
  wgetAsync,
  existsSync,
  download,
  detectCurl,
  detectFfmpeg,
  imageToRaw,
} from "@mpv-easy/tool"

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
    const curl = detectCurl()
    if (curl) {
      await download(url, outputPath, curl)
    } else {
      await wgetAsync(url, outputPath)
    }
    print(`[youtube] download done: ${outputPath}`)
    return true
  } catch (e) {
    print(`[youtube] download failed: ${url} error: ${e}`)
    return false
  }
}

export async function downloadAndConvertThumbnail(
  url: string,
  tmpPath: string,
  bgraPath: string,
) {
  try {
    // Skip convert if bgra file already exists
    if (existsSync(bgraPath)) {
      return
    }

    const ok = await downloadThumbnail(url, tmpPath)
    if (!ok) {
      print(`[youtube] download failed, skip convert: ${url}`)
      return null
    }
    print(`[youtube] converting: ${tmpPath} -> ${bgraPath}`)
    const ffmpeg = detectFfmpeg()
    if (ffmpeg) {
      await imageToRaw(tmpPath, bgraPath, "bgra", ffmpeg)
    } else {
      await convertImageAsync(tmpPath, bgraPath)
    }
    print(`[youtube] convert done: ${bgraPath}`)
    return null
  } catch (e) {
    print(`[youtube] convert failed: ${tmpPath} error: ${e}`)
    return null
  }
}
