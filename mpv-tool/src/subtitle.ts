import { SubtitleTypes, isHttp } from "./common";
import { fetch } from "./rs-ext";
import { existsSync } from "./fs";
import { commandv, getProperty, getPropertyNative, getenv, joinPath, writeFile } from "./mpv";
import { getFileName } from "./path";
import type { TrackItem } from "./type";

export function loadRemoteSubtitle(path = getProperty("path")) {
  if (!path?.length) {
    return;
  }
  const trackList = (getPropertyNative<TrackItem[]>("track-list") || []).filter(
    (i) => i.type === "sub",
  );
  if (isHttp(path)) {
    const list = SubtitleTypes.map((i) => {
      const s = path.split(".").slice(0, -1);
      s.push(i);
      return s.join(".");
    });
    const tmp = getenv("TMPDIR") || getenv("TMP") || getenv("tmp") || "./";
    for (const url of list) {
      const name = getFileName(url);
      if (!name?.length) {
        continue;
      }

      if (trackList.find((i) => i.title === name)) {
        continue;
      }

      try {
        const resp = fetch(url);

        if (resp.status !== 200 || !resp.text?.length) {
          continue;
        }

        const subPath = joinPath(tmp, name);
        writeFile(subPath, resp.text);
        commandv("sub-add", subPath);
      } catch (e) {
        print('fetch error:', e)
      }
    }
  } else {
    const list = SubtitleTypes.map((i) => {
      const s = path.split(".").slice(0, -1);
      s.push(i);
      return s.join(".");
    });
    for (const url of list) {
      const name = getFileName(url);
      if (trackList.find((i) => i.title === name)) {
        continue;
      }
      if (existsSync(url)) {
        commandv("sub-add", url);
      }
    }
  }
}