#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]

use mpv_easy_ext::{common::set_remote_hook, remote::remote};

fn main() {
    let mut args = std::env::args().skip(1);
    match (args.next(), args.next()) {
        (Some(exe_path), Some(b64)) => {
            if let Err(e) = remote(&exe_path, &b64) {
                eprintln!("Remote execution failed: {}", e);
            }
        }
        (exe_path, None) => {
            // Register protocol handler when no b64 payload provided
            match set_remote_hook(exe_path) {
                Ok(Some(_)) => {
                    println!("Remote hook set successfully");
                }
                Ok(None) => {
                    eprintln!("Failed to set remote hook: player not found");
                }
                Err(e) => {
                    eprintln!("Failed to set remote hook: {}", e);
                }
            }
        }
        _ => {
            eprintln!("Usage: mpv-easy-remote [exe_path] [base64_payload]");
        }
    }
}
