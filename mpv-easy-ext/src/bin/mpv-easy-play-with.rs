#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]

use base64::{Engine, prelude::BASE64_STANDARD};
use flate2::read::GzDecoder;
use mpv_easy_ext::common::{CHUNK_PREFIX, M3U_NAME, PlayWith, Player, set_protocol_hook};
use std::io::Read;
use strum::IntoEnumIterator;

fn play_with(exe_path: String, mut b64: String) {
    let Some(player) = Player::from_path(&exe_path) else {
        return;
    };

    if b64.ends_with('/') {
        b64 = b64[..b64.len() - 1].to_string();
    }

    for i in Player::iter() {
        if b64.starts_with(i.header()) {
            b64 = b64[i.header().len()..].to_string();
            break;
        }
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
    if play_with.playlist.list.is_empty() {
        return;
    }

    let m3u = player.stringify(play_with.playlist);
    let m3u_path = tmp_dir.join(M3U_NAME);
    std::fs::write(&m3u_path, m3u).unwrap();
    player.start(&exe_path, &m3u_path, play_with.args, play_with.start);
}

fn main() {
    let mut args = std::env::args().skip(1);
    match (args.next(), args.next()) {
        (Some(exe_path), Some(b64)) => {
            play_with(exe_path, b64);
        }
        (exe_path, None) => {
            set_protocol_hook(exe_path);
        }
        _ => {
            todo!("mpv-easy-play-with not support yet!")
        }
    };
}
