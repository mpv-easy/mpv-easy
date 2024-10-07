const fs = require("fs");

async function download(url, filePath) {
  const buf = await fetch(url).then((r) => r.arrayBuffer());
  fs.writeFileSync(filePath, new Uint8Array(buf));
}

async function downloadMpv() {
  // https://github.com/shinchiro/mpv-winbuild-cmake/releases
  const { assets } = await fetch(
    "https://api.github.com/repos/shinchiro/mpv-winbuild-cmake/releases/latest"
  ).then((r) => r.json());
  const mpvUrl = assets.find((i) =>
    i.name.startsWith("mpv-x86_64-v3-")
  ).browser_download_url;
  await download(mpvUrl, "./mpv-win.7z");
  const ffmpegUrl = assets.find((i) =>
    i.name.startsWith("ffmpeg-x86_64-v3-")
  ).browser_download_url;
  await download(ffmpegUrl, "./ffmpeg.7z");
}

async function downloadYtdl() {
  // https://github.com/yt-dlp/yt-dlp/releases
  const { assets } = await fetch(
    "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest"
  ).then((r) => r.json());
  const ytUrl = assets.find((i) =>
    i.name.startsWith("yt-dlp.exe")
  ).browser_download_url;
  await download(ytUrl, "./yt-dlp.exe");
}

downloadMpv();
downloadYtdl();
