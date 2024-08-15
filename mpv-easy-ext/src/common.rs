#[cfg(target_os = "windows")]
pub fn set_protocol_hook(mpv_path: Option<String>) {
    let mpv_play_with_path = std::env::current_exe().unwrap();
    let mpv_default_path = mpv_play_with_path
        .parent()
        .unwrap()
        .join("mpv.exe")
        .to_string_lossy()
        .to_string();

    let mpv_play_with_path = mpv_play_with_path
        .to_string_lossy()
        .to_string()
        .replace("\\", "\\\\");
    let mpv_path = mpv_path
        .map(|p| std::path::Path::new(&p).to_string_lossy().to_string())
        .unwrap_or(mpv_default_path)
        .replace("/", "\\")
        .replace("\\", "\\\\");

    let reg_code = format!(
        r#"
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge]
"ExternalProtocolDialogShowAlwaysOpenCheckbox"=dword:00000001

[HKEY_CLASSES_ROOT\mpv-easy]
@="mpv-easy"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\mpv-easy\DefaultIcon]
@=""

[HKEY_CLASSES_ROOT\mpv-easy\shell]
@=""

[HKEY_CLASSES_ROOT\mpv-easy\shell\open]
@=""

[HKEY_CLASSES_ROOT\mpv-easy\shell\open\command]
@="\"{mpv_play_with_path}\" \"{mpv_path}\" \"%1\""
"#
    );
    let tmp_dir = std::env::temp_dir();
    let tmp_path = tmp_dir.join("set-protocol-hook-windows.reg");
    let tmp_path = tmp_path.to_string_lossy().to_string().replace("/", "\\");
    std::fs::write(&tmp_path, reg_code.trim()).unwrap();
    let mut cmd = std::process::Command::new("regedit.exe");
    cmd.args(["/S", &tmp_path]);
    cmd.output().unwrap();
}

#[cfg(not(target_os = "windows"))]
pub fn set_protocol_hook(mpv_path: Option<String>) {}
