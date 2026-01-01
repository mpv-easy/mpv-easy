use serde_m3u::Entry;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
pub use strum::IntoEnumIterator;
use strum_macros::EnumIter;
use urlencoding::encode;

pub const JELLYFIN_SUBTITLES: &str = "jellyfin_subtitles";
pub const MPV_PLAY_WITH_HEADER: &str = "mpv-easy://";
pub const VLC_PLAY_WITH_HEADER: &str = "vlc-easy://";
pub const POT_PLAY_WITH_HEADER: &str = "pot-easy://";
pub const MPV_PLAY_WITH_HKEY: &str = "mpv-easy";
pub const VLC_PLAY_WITH_HKEY: &str = "vlc-easy";
pub const POT_PLAY_WITH_HKEY: &str = "pot-easy";
pub const MPV_REMOTE_HKEY: &str = "mpv-remote";
pub const VLC_REMOTE_HKEY: &str = "vlc-remote";
pub const POT_REMOTE_HKEY: &str = "pot-remote";
pub const MPV_REMOTE_HEADER: &str = "mpv-remote://";
pub const VLC_REMOTE_HEADER: &str = "vlc-remote://";
pub const POT_REMOTE_HEADER: &str = "pot-remote://";
pub const M3U_NAME: &str = "mpv-easy-play-with.m3u8";
pub const CHUNK_PREFIX: &str = "mpv-easy-play-with-chunk-";

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
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub args: Vec<String>,
    pub log: Option<String>,
}

#[derive(EnumIter, Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum Player {
    Mpv,
    Vlc,
    Pot,
}

impl Player {
    pub fn from_path(s: &str) -> Option<Self> {
        let binding = PathBuf::from(s);
        let name = binding.file_name()?.to_str()?;
        match name {
            "mpv.exe" | "mpv" => Some(Player::Mpv),
            "vlc.exe" | "vlc" => Some(Player::Vlc),
            "PotPlayerMini64.exe" | "PotPlayerMini64" => Some(Player::Pot),
            _ => None,
        }
    }
    pub fn stringify(&self, mut playlist: Playlist) -> String {
        match self {
            Player::Mpv => {
                let mut v = vec!["#EXTM3U".to_owned()];

                for PlayItem { video, subtitles } in &mut playlist.list {
                    if !subtitles.is_empty()
                        && let Ok(s) = serde_json::to_string(subtitles)
                    {
                        video.url = format!("{}&{JELLYFIN_SUBTITLES}={}", video.url, encode(&s));
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
            Player::Pot => {
                let mut v = vec!["#EXTM3U".to_owned()];

                for PlayItem {
                    video,
                    subtitles: _,
                } in &mut playlist.list
                {
                    v.push(video.to_string());
                }
                v.join("\n")
            }
        }
    }

    pub fn play_with_header(&self) -> &'static str {
        match self {
            Player::Mpv => MPV_PLAY_WITH_HEADER,
            Player::Vlc => VLC_PLAY_WITH_HEADER,
            Player::Pot => POT_PLAY_WITH_HEADER,
        }
    }
    pub fn remote_header(&self) -> &'static str {
        match self {
            Player::Mpv => MPV_REMOTE_HEADER,
            Player::Vlc => VLC_REMOTE_HEADER,
            Player::Pot => POT_REMOTE_HEADER,
        }
    }
    pub fn play_with_hkey(&self) -> &'static str {
        match self {
            Player::Mpv => MPV_PLAY_WITH_HKEY,
            Player::Vlc => VLC_PLAY_WITH_HKEY,
            Player::Pot => POT_PLAY_WITH_HKEY,
        }
    }

    pub fn remote_hkey(&self) -> &'static str {
        match self {
            Player::Mpv => MPV_REMOTE_HKEY,
            Player::Vlc => VLC_REMOTE_HKEY,
            Player::Pot => POT_REMOTE_HKEY,
        }
    }

    pub fn ipc(&self, name: &str, cmd: &str) -> anyhow::Result<String> {
        let mut c = std::process::Command::new("cmd");

        #[cfg(target_os = "windows")]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            c.creation_flags(CREATE_NO_WINDOW);
        }

        let subcmd = format!("echo {cmd} > \\\\.\\pipe\\{name}");
        let output = c.args(["/c", &subcmd]).output()?;
        let s = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(s)
    }

    pub fn start(
        &self,
        exe_path: &str,
        m3u_path: Option<&Path>,
        args: Vec<String>,
        start: Option<u32>,
    ) {
        let exe_path = std::path::PathBuf::from(exe_path);
        let mut cmd = std::process::Command::new(&exe_path);
        let mpv_dir = exe_path.parent().unwrap();
        cmd.current_dir(mpv_dir);

        match self {
            Player::Mpv => {
                let mut args_str = String::new();
                if let Some(p) = m3u_path {
                    args_str.push_str(&format!(" --playlist={} ", p.to_string_lossy()));
                }

                if let Some(start) = start {
                    args_str.push_str(&format!(" --playlist-start={} ", start));
                }

                args_str.push_str(" --script-opts-append=mpv-easy-ontop=yes ");
                if !args.is_empty() {
                    args_str.push_str(&args.join(" "));
                }
                println!("args_str: {} {}", exe_path.to_string_lossy(), args_str);

                #[cfg(windows)]
                cmd.raw_arg(args_str);
                #[cfg(not(windows))]
                cmd.arg(args_str);

                cmd.output().unwrap();
            }
            Player::Vlc => {
                if let Some(m3u_path) = m3u_path {
                    cmd.arg(m3u_path.to_string_lossy().to_string());

                    if let Some(start) = start {
                        cmd.arg("--playlist-start");
                        cmd.arg(start.to_string());
                    }

                    cmd.output().unwrap();
                }
            }
            Player::Pot => {
                if let Some(m3u_path) = m3u_path {
                    cmd.arg(m3u_path.to_string_lossy().to_string());
                    cmd.output().unwrap();
                }
            }
        }
    }
}

#[cfg(target_os = "windows")]
pub fn set_play_with_hook(exe_path: Option<String>) -> Option<Player> {
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

    let pot_default_path = play_with_path
        .parent()?
        .join("PotPlayerMini64.exe")
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
        })
        .or_else(|| {
            if std::fs::exists(&pot_default_path).unwrap_or(false) {
                return Some(pot_default_path);
            }
            None
        })?
        .replace("/", "\\")
        .replace("\\", "\\\\");

    if !std::fs::exists(&exe_path).unwrap_or(false) {
        return None;
    }

    let player = Player::from_path(&exe_path)?;
    let hkey = player.play_with_hkey();
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

    let tmp_dir = std::env::temp_dir();
    let tmp_path = tmp_dir.join("set-play-with-protocol-hook-windows.reg");
    let tmp_path = tmp_path.to_string_lossy().to_string().replace("/", "\\");
    std::fs::write(&tmp_path, reg_code.trim()).unwrap();
    let mut cmd = std::process::Command::new("regedit.exe");
    cmd.args(["/S", &tmp_path]);
    cmd.output().ok()?;
    Some(player)
}

#[cfg(not(target_os = "windows"))]
pub fn set_play_with_hook(mpv_path: Option<String>) -> Option<Player> {
    None
}

#[cfg(target_os = "windows")]
pub fn set_remote_hook(exe_path: Option<String>) -> Option<Player> {
    let remote_path = std::env::current_exe().unwrap();

    let mpv_default_path = remote_path
        .parent()?
        .join("mpv.exe")
        .to_string_lossy()
        .to_string();

    let remote_path = remote_path
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
        })?
        .replace("/", "\\")
        .replace("\\", "\\\\");

    if !std::fs::exists(&exe_path).unwrap_or(false) {
        return None;
    }

    let player = Player::from_path(&exe_path)?;
    let hkey = player.remote_hkey();
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
@="\"{remote_path}\" \"{exe_path}\" \"%1\""
"#
    )
    .trim()
    .to_string();

    let tmp_dir = std::env::temp_dir();
    let tmp_path = tmp_dir.join("set-remote-protocol-hook-windows.reg");
    let tmp_path = tmp_path.to_string_lossy().to_string().replace("/", "\\");
    std::fs::write(&tmp_path, reg_code.trim()).unwrap();
    let mut cmd = std::process::Command::new("regedit.exe");
    cmd.args(["/S", &tmp_path]);
    cmd.output().ok()?;
    Some(player)
}

#[cfg(not(target_os = "windows"))]
pub fn set_remote_hook(mpv_path: Option<String>) -> Option<Player> {
    None
}
