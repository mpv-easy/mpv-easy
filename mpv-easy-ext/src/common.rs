use serde_m3u::Entry;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use urlencoding::encode;

pub const JELLYFIN_SUBTITLES: &str = "jellyfin_subtitles";
pub const MPV_HEADER: &str = "mpv-easy://";
pub const VLC_HEADER: &str = "vlc-easy://";
pub const MPV_HKEY: &str = "mpv-easy";
pub const VLC_HKEY: &str = "vlc-easy";
pub const M3U_NAME: &str = "mpv-easy-play-with.m3u8";
pub const CHUNK_PREFIX: &str = "mpv-easy-play-with-chunk-";
pub const LOG_FILE_NAME: &str = "mpv-easy-play-with.log";

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct Subtitle {
    url: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    default: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    lang: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct PlayItem {
    video: Entry,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    subtitles: Vec<Subtitle>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct Playlist {
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub list: Vec<PlayItem>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
pub struct PlayWith {
    pub playlist: Playlist,
    pub start: Option<u32>,
    // args when start mpv
    pub args: Option<Vec<String>>,
    pub log: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum Player {
    Mpv,
    Vlc,
    // TODO
    // Potplayer,
}

impl Player {
    pub fn from_path(s: &str) -> Option<Self> {
        let binding = PathBuf::from(s);
        let name = binding.file_name()?.to_str()?;
        match name {
            "mpv.exe" | "mpv" => Some(Player::Mpv),
            "vlc.exe" | "vlc" => Some(Player::Vlc),
            _ => None,
        }
    }
    pub fn stringify(&self, mut playlist: Playlist) -> String {
        match self {
            Player::Mpv => {
                let mut v = vec!["#EXTM3U".to_owned()];

                for PlayItem { video, subtitles } in &mut playlist.list {
                    if !subtitles.is_empty() {
                        if let Ok(s) = serde_json::to_string(subtitles) {
                            video.url =
                                format!("{}&{JELLYFIN_SUBTITLES}={}", video.url, encode(&s));
                        }
                    }
                    v.push(video.to_string());
                }

                v.join("\n")
            }
            Player::Vlc => {
                let mut v = vec!["#EXTM3U".to_owned()];

                for PlayItem { video, subtitles } in &mut playlist.list {
                    if !subtitles.is_empty() {
                        let sub = match subtitles.iter().find(|i| i.default.unwrap_or(false)) {
                            Some(sub) => sub,
                            None => &subtitles[0],
                        };
                        video.vlc_opt.push(("sub-file".to_owned(), sub.url.clone()));
                    }
                    v.push(video.to_string());
                }
                v.join("\n")
            }
        }
    }

    pub fn header(&self) -> &'static str {
        match self {
            Player::Mpv => MPV_HEADER,
            Player::Vlc => VLC_HEADER,
        }
    }

    pub fn hkey(&self) -> &'static str {
        match self {
            Player::Mpv => MPV_HKEY,
            Player::Vlc => VLC_HKEY,
        }
    }

    pub fn start(
        &self,
        exe_path: &str,
        m3u_path: &Path,
        args: Option<Vec<String>>,
        start: Option<u32>,
    ) {
        let exe_path = std::path::PathBuf::from(exe_path);
        let mut cmd = std::process::Command::new(&exe_path);
        let mpv_dir = exe_path.parent().unwrap();
        cmd.current_dir(mpv_dir);

        match self {
            Player::Mpv => {
                let mut args_str = format!(" --playlist={} ", m3u_path.to_string_lossy());

                if let Some(start) = start {
                    args_str.push_str(&format!(" --playlist-start={} ", start));
                }

                if let Some(args) = &args {
                    args_str.push_str(&args.join(" "));
                }

                #[cfg(windows)]
                cmd.raw_arg(args_str);
                #[cfg(not(windows))]
                cmd.arg(args_str);

                cmd.output().unwrap();
            }
            Player::Vlc => {
                let mut args_str = m3u_path.to_string_lossy().to_string();

                if let Some(start) = start {
                    args_str.push_str(&format!(" --playlist-start={} ", start));
                }

                #[cfg(windows)]
                cmd.raw_arg(args_str);
                #[cfg(not(windows))]
                cmd.arg(args_str);

                cmd.output().unwrap();
            }
        }
    }
}

#[cfg(target_os = "windows")]
pub fn set_protocol_hook(exe_path: Option<String>) -> Option<Player> {
    let play_with_path = std::env::current_exe().unwrap();

    let mpv_default_path = play_with_path
        .parent()?
        .join("mpv.exe")
        .to_string_lossy()
        .to_string();

    let vlc_default_path = play_with_path
        .parent()?
        .join("vlc.exe")
        .to_string_lossy()
        .to_string();

    let play_with_path = play_with_path
        .to_string_lossy()
        .to_string()
        .replace("\\", "\\\\");

    let exe_path = exe_path
        .map(|p| std::path::Path::new(&p).to_string_lossy().to_string())
        .or_else(|| {
            if std::fs::exists(&mpv_default_path).unwrap_or(false) {
                return Some(mpv_default_path);
            }
            None
        })
        .or_else(|| {
            if std::fs::exists(&vlc_default_path).unwrap_or(false) {
                return Some(vlc_default_path);
            }
            None
        })?
        .replace("/", "\\")
        .replace("\\", "\\\\");

    if !std::fs::exists(&exe_path).unwrap_or(false) {
        return None;
    }

    let player = Player::from_path(&exe_path)?;
    let hkey = player.hkey();
    let reg_code = format!(
        r#"
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_CLASSES_ROOT\{hkey}]
@="{hkey}"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\{hkey}\DefaultIcon]
@=""

[HKEY_CLASSES_ROOT\{hkey}\shell]
@=""

[HKEY_CLASSES_ROOT\{hkey}\shell\open]
@=""

[HKEY_CLASSES_ROOT\{hkey}\shell\open\command]
@="\"{play_with_path}\" \"{exe_path}\" \"%1\""
"#
    )
    .trim()
    .to_string();

    println!("reg_code: {}", reg_code);
    let tmp_dir = std::env::temp_dir();
    let tmp_path = tmp_dir.join("set-protocol-hook-windows.reg");
    let tmp_path = tmp_path.to_string_lossy().to_string().replace("/", "\\");
    std::fs::write(&tmp_path, reg_code.trim()).unwrap();
    let mut cmd = std::process::Command::new("regedit.exe");
    cmd.args(["/S", &tmp_path]);
    cmd.output().ok()?;
    Some(player)
}

#[cfg(not(target_os = "windows"))]
pub fn set_protocol_hook(mpv_path: Option<String>) -> Option<Player> {
    None
}
