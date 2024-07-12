#![windows_subsystem = "windows"]

use base64::{prelude::BASE64_STANDARD, Engine};
use flate2::read::GzDecoder;
use std::io::prelude::*;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Play {
    url: String,
    args: Vec<String>,
    title: String,
}

const HEADER: &str = "mpv-easy://";

const M3U_NAME: &str = "mpv-easy-play-with.m3u";
const CHUNK_PREFIX: &str = "mpv-easy-play-with-chunk-";

fn main() {
    let mut args = std::env::args().skip(1);
    let mpv_path = args.next().unwrap();
    let mut b64 = args.next().unwrap();

    if b64.ends_with('/') {
        b64 = b64[..b64.len() - 1].to_string();
    }
    if b64.starts_with(HEADER) {
        b64 = b64[HEADER.len()..].to_string();
    }

    let chunk_index = b64.find("?");
    let count_index = b64.find("&");
    let tmp_dir = std::env::temp_dir();

    if let (Some(chunk_index), Some(count_index)) = (chunk_index, count_index) {
        let chunk_id: u32 = b64[chunk_index+1..count_index].parse().unwrap();
        let chunk_count: u32 = b64[count_index+1..].parse().unwrap();
        let chunk = &b64[0..chunk_index];
        let chunk_name = format!("{}-{}", CHUNK_PREFIX, chunk_id);
        let chunk_path = tmp_dir.join(chunk_name);

        std::fs::write(chunk_path, chunk).unwrap();

        let file_list: Vec<_> = (0..chunk_count)
            .map(|i| tmp_dir.join(format!("{}-{}", CHUNK_PREFIX, i)))
            .collect();

        let ready = file_list.iter().all(|i| i.exists());

        if ready {
            b64 = file_list
                .iter()
                .map(|i| {
                    let s = std::fs::read_to_string(i).unwrap();
                    std::fs::remove_file(i).unwrap();
                    return s;
                })
                .collect();
        } else {
            return;
        }
    }

    let gzip = BASE64_STANDARD.decode(b64).unwrap();

    let mut decoder = GzDecoder::new(&gzip[..]);
    let mut json_str = String::new();
    decoder.read_to_string(&mut json_str).unwrap();

    let play_list: Vec<Play> = serde_json::from_str(&json_str).unwrap();
    let mut cmd = std::process::Command::new(mpv_path);
    if play_list.is_empty() {
        return;
    }
    if play_list.len() == 1 {
        let play = &play_list[0];
        let mut args = vec![format!("\"{}\"", &play.url)];
        if !play.title.is_empty() {
            args.push(format!("--force-media-title=\"{}\"", play.title));
        }
        for i in play.args.clone() {
            args.push(i);
        }
        let args_str = args.join(" ");

        #[cfg(windows)]
        cmd.raw_arg(args_str);

        #[cfg(not(windows))]
        cmd.arg(args_str);

        cmd.output().unwrap();
        return;
    }

    let mut m3u = vec!["#EXTM3U".to_string()];
    for play in play_list {
        m3u.push(format!("#EXTINF:-1,{}", play.title));
        m3u.push(play.url);
    }
    let m3u_path = tmp_dir.join(M3U_NAME);
    std::fs::write(&m3u_path, m3u.join("\n")).unwrap();

    let args_str = format!("--playlist={}", m3u_path.to_string_lossy());
    #[cfg(windows)]
    cmd.raw_arg(args_str);
    #[cfg(not(windows))]
    cmd.arg(args_str);

    cmd.output().unwrap();
}
