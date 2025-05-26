const fs = require("fs");

const headers: RequestInit = {
  headers: {
    'User-Agent': 'GitHub Actions',
    Connection: 'close',
    Authorization: `token ${process.env.GITHUB_TOKEN}`
  }
}

async function download(url, filePath) {
  const buf = await fetch(url).then((r) => r.arrayBuffer(), headers);
  fs.writeFileSync(filePath, new Uint8Array(buf));
}

async function downloadMpv() {
  // https://github.com/shinchiro/mpv-winbuild-cmake/releases
  const { assets } = await fetch(
    "https://api.github.com/repos/shinchiro/mpv-winbuild-cmake/releases/latest", headers
  ).then((r) => r.json());

  const mpvV3Url = assets.find((i) =>
    i.name.startsWith("mpv-x86_64-v3-")
  ).browser_download_url;
  await download(mpvV3Url, "./mpv-v3-win.7z");

  const mpvUrl = assets.find((i) =>
    i.name.startsWith("mpv-x86_64-2")
  ).browser_download_url;
  await download(mpvUrl, "./mpv-win.7z");

  const ffmpegV3Url = assets.find((i) =>
    i.name.startsWith("ffmpeg-x86_64-v3-")
  ).browser_download_url;
  await download(ffmpegV3Url, "./ffmpeg-v3.7z");

  const ffmpegUrl = assets.find((i) =>
    i.name.startsWith("ffmpeg-x86_64-git")
  ).browser_download_url;
  await download(ffmpegUrl, "./ffmpeg.7z");
}

async function downloadYtdl() {
  // https://github.com/yt-dlp/yt-dlp/releases
  const { assets } = await fetch(
    "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest", headers
  ).then((r) => r.json());
  const ytUrl = assets.find((i) =>
    i.name.startsWith("yt-dlp.exe")
  ).browser_download_url;
  await download(ytUrl, "./yt-dlp.exe");
}

downloadMpv();
downloadYtdl();
