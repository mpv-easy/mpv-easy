#![windows_subsystem = "windows"]

use std::os::windows::process::CommandExt;

use base64::{prelude::BASE64_STANDARD, Engine};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Play {
    url: String,
    args: Vec<String>,
    title: String,
}

const HEADER: &str = "mpv-easy://";

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

    let bin = BASE64_STANDARD.decode(b64).unwrap();
    let text = String::from_utf8_lossy(&bin);
    let play_list: Vec<Play> = serde_json::from_str(&text).unwrap();
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
        cmd.raw_arg(args_str);
        cmd.output().unwrap();
    }

    // TODO: support playlist
}
