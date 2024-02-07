#[cfg(target_os = "macos")]
pub mod clip_mac;
#[cfg(target_os = "windows")]
pub mod clip_win;

#[cfg(target_os = "linux")]
pub mod clip_linux;

