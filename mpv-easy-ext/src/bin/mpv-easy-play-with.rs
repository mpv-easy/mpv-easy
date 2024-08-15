#![windows_subsystem = "windows"]

use base64::{prelude::BASE64_STANDARD, Engine};
use flate2::read::GzDecoder;
use mpv_easy_ext::common::set_protocol_hook;
use serde_m3u::Playlist;
use std::io::prelude::*;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PlayWith {
    pub playlist: Playlist,
    pub start: Option<i32>,
    // args when start mpv
    pub args: Option<Vec<String>>,
    pub log: Option<String>,
}

const HEADER: &str = "mpv-easy://";
const M3U_NAME: &str = "mpv-easy-play-with.m3u8";
const CHUNK_PREFIX: &str = "mpv-easy-play-with-chunk-";
const LOG_FILE_NAME: &str = "mpv-easy-play-with.log";

fn play_with(mpv_path: String, mut b64: String) {
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
        let chunk_id: u32 = b64[chunk_index + 1..count_index].parse().unwrap();
        let chunk_count: u32 = b64[count_index + 1..].parse().unwrap();
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
                    s
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

    let play_with: PlayWith = serde_json::from_str(&json_str).unwrap();
    let mpv_path = std::path::PathBuf::from(mpv_path);
    let mut cmd = std::process::Command::new(&mpv_path);
    let mpv_dir = mpv_path.parent().unwrap();
    cmd.current_dir(mpv_dir);
    if play_with.playlist.list.is_empty() {
        return;
    }

    let m3u = play_with.playlist.to_string();

    let m3u_path = tmp_dir.join(M3U_NAME);
    std::fs::write(&m3u_path, m3u).unwrap();

    let mut args_str = format!(" --playlist={} ", m3u_path.to_string_lossy());

    if let Some(start) = play_with.start {
        args_str.push_str(&format!(" --playlist-start={} ", start));
    }

    if let Some(args) = play_with.args {
        args_str.push_str(&args.join(" "));
    }

    let log_path = play_with
        .log
        .unwrap_or(tmp_dir.join(LOG_FILE_NAME).to_string_lossy().to_string());
    args_str.push_str(&format!(" --log-file=\"{}\" ", log_path));

    #[cfg(windows)]
    cmd.raw_arg(args_str);
    #[cfg(not(windows))]
    cmd.arg(args_str);

    cmd.output().unwrap();
}

fn main() {
    let mut args = std::env::args().skip(1);
    match (args.next(), args.next()) {
        (Some(mpv_path), Some(b64)) => {
            play_with(mpv_path, b64);
        }
        (mpv_path, None) => {
            set_protocol_hook(mpv_path);
        }
        _ => {
            todo!("mpv-easy-play-with not support yet!")
        }
    };
}
