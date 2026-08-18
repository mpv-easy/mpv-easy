use serde_m3u::Entry;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
pub use strum::IntoEnumIterator;
use strum_macros::EnumIter;
use urlencoding::encode;
#[cfg(target_os = "windows")]
use proto_reg::{Protocol, ProtocolManager};
use crate::error::{Error, Result};

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
    pub video: Entry,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub subtitles: Vec<Subtitle>,
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

    pub fn ipc(&self, name: &str, cmd: &str) -> Result<String> {
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
    ) -> Result<()> {
        let exe_path = std::path::PathBuf::from(exe_path);
        let mut cmd = std::process::Command::new(&exe_path);
        let mpv_dir = exe_path.parent().ok_or(Error::Other("invalid exe path".into()))?;
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

                cmd.output()?;
            }
            Player::Vlc => {
                if let Some(m3u_path) = m3u_path {
                    cmd.arg(m3u_path.to_string_lossy().to_string());

                    if let Some(start) = start {
                        cmd.arg("--playlist-start");
                        cmd.arg(start.to_string());
                    }

                    cmd.output()?;
                }
            }
            Player::Pot => {
                if let Some(m3u_path) = m3u_path {
                    cmd.arg(m3u_path.to_string_lossy().to_string());
                    cmd.output()?;
                }
            }
        }
        Ok(())
    }
}

/// Path of the current executable, normalized to backslash separators.
#[cfg(target_os = "windows")]
fn current_exe_path() -> Result<String> {
    let exe = std::env::current_exe()?;
    Ok(exe.to_string_lossy().replace('/', "\\"))
}

/// Finds the player executable: an explicitly passed `exe_path`, otherwise
/// the first existing candidate next to the current executable.
#[cfg(target_os = "windows")]
fn find_player(
    exe_path: Option<String>,
    candidates: &[&str],
) -> Result<Option<(String, Player)>> {
    let current_exe = std::env::current_exe()?;
    let dir = current_exe
        .parent()
        .ok_or(Error::Other("invalid current_exe path".into()))?;

    let Some(exe_path) = exe_path
        .map(|p| Path::new(&p).to_string_lossy().to_string())
        .or_else(|| {
            candidates.iter().find_map(|candidate| {
                let path = dir.join(candidate);
                std::fs::exists(&path)
                    .unwrap_or(false)
                    .then(|| path.to_string_lossy().to_string())
            })
        })
    else {
        return Ok(None);
    };

    // Normalize separators for the registry command line.
    let exe_path = exe_path.replace('/', "\\");

    if !std::fs::exists(&exe_path).unwrap_or(false) {
        return Ok(None);
    }

    let Some(player) = Player::from_path(&exe_path) else {
        return Ok(None);
    };
    Ok(Some((exe_path, player)))
}

/// Registers `hkey` as a URL protocol launching `hook_path` with the player
/// `exe_path` and the original URL (`%1`).
#[cfg(target_os = "windows")]
fn register_hook(hkey: &str, hook_path: &str, exe_path: &str) -> Result<()> {
    let mut protocol =
        Protocol::new(hkey, format!("\"{hook_path}\" \"{exe_path}\" \"%1\""))?;
    protocol.description = hkey.to_string();
    // Keep the empty `DefaultIcon` value written by the original `.reg` files.
    protocol.icon = Some(String::new());
    ProtocolManager::add(&protocol)?;
    Ok(())
}

/// Registers the "play with" URL protocol (`mpv-easy://`, `vlc-easy://`,
/// `pot-easy://`) for the first supported player next to this executable,
/// or the explicitly given `exe_path`.
///
/// Returns `Ok(None)` when no supported player is found. Requires an
/// elevated process.
#[cfg(target_os = "windows")]
pub fn set_play_with_hook(exe_path: Option<String>) -> Result<Option<Player>> {
    let Some((exe_path, player)) =
        find_player(exe_path, &["mpv.exe", "vlc.exe", "PotPlayerMini64.exe"])?
    else {
        return Ok(None);
    };

    // Show the "Always open these links" checkbox in the Chrome/Edge dialog
    // so users can allow `mpv-easy://` links permanently.
    ProtocolManager::set_browser_policy(true)?;
    register_hook(player.play_with_hkey(), &current_exe_path()?, &exe_path)?;
    Ok(Some(player))
}

#[cfg(not(target_os = "windows"))]
pub fn set_play_with_hook(_exe_path: Option<String>) -> Result<Option<Player>> {
    Ok(None)
}

/// Registers the "remote" URL protocol (`mpv-remote://`, `vlc-remote://`,
/// `pot-remote://`) for the mpv executable next to this executable, or the
/// explicitly given `exe_path`.
///
/// Returns `Ok(None)` when no supported player is found. Requires an
/// elevated process.
#[cfg(target_os = "windows")]
pub fn set_remote_hook(exe_path: Option<String>) -> Result<Option<Player>> {
    let Some((exe_path, player)) = find_player(exe_path, &["mpv.exe"])? else {
        return Ok(None);
    };

    // Show the "Always open these links" checkbox in the Chrome/Edge dialog
    // so users can allow `mpv-remote://` links permanently.
    ProtocolManager::set_browser_policy(true)?;
    register_hook(player.remote_hkey(), &current_exe_path()?, &exe_path)?;
    Ok(Some(player))
}

#[cfg(not(target_os = "windows"))]
pub fn set_remote_hook(_exe_path: Option<String>) -> Result<Option<Player>> {
    Ok(None)
}
