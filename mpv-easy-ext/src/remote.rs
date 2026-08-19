
use base64::{prelude::BASE64_STANDARD, Engine};
use flate2::read::GzDecoder;
use crate::common::Player;
use crate::error::{Error, Result};
use std::io::Read;
use strum::IntoEnumIterator;

/// Remove trailing slash from a string if present
fn trim_trailing_slash(s: &str) -> &str {
    s.strip_suffix('/').unwrap_or(s)
}

/// Strip the remote protocol header from the payload
fn strip_remote_header(payload: &str) -> &str {
    Player::iter()
        .find_map(|p| payload.strip_prefix(p.remote_header()))
        .unwrap_or(payload)
}

/// Decode base64 + gzip compressed JSON arguments
fn decode_payload(payload: &str) -> Result<Vec<String>> {
    let gzip_data = BASE64_STANDARD
        .decode(payload)
        .map_err(|e| Error::Other(format!("Failed to decode base64 payload: {e}")))?;

    let mut decoder = GzDecoder::new(&gzip_data[..]);
    let mut json_str = String::new();
    decoder
        .read_to_string(&mut json_str)
        .map_err(|e| Error::Other(format!("Failed to decompress gzip data: {e}")))?;

    serde_json::from_str(&json_str).map_err(|e| Error::Other(format!("Failed to parse JSON arguments: {e}")))
}

/// Execute remote command for the specified player
pub fn remote(exe_path: &str, b64: &str) -> Result<()> {
    let player = Player::from_path(exe_path).ok_or_else(|| {
        Error::Other(format!("Unsupported player executable: {exe_path}"))
    })?;

    // Clean up the payload: remove trailing slash and protocol header
    let cleaned = trim_trailing_slash(b64);
    let stripped = strip_remote_header(cleaned);

    // Split payload and optional IPC name
    let (payload, ipc_name) = stripped
        .split_once('?')
        .map(|(p, n)| (p, Some(n)))
        .unwrap_or((stripped, None));

    let payload = trim_trailing_slash(payload);
    let args = decode_payload(payload)?;

    match ipc_name {
        Some(name) => {
            // Send commands via IPC pipe
            for cmd in &args {
                match player.ipc(name, cmd) {
                    Ok(result) => println!("IPC result: {}", result),
                    Err(e) => eprintln!("IPC error: {}", e),
                }
            }
        }
        None => {
            // Start player with arguments
            player.start(exe_path, None, args, None)?;
        }
    }

    Ok(())
}
