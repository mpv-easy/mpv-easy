use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("UTF-8 error: {0}")]
    Utf8(#[from] std::string::FromUtf8Error),
    #[error("Base64 decode error: {0}")]
    Base64(#[from] base64::DecodeError),
    #[error("MPV error: {0}")]
    Mpv(String),
    #[error("Other error: {0}")]
    Other(String),
    // `proto-reg` is a Windows-only dependency.
    #[cfg(target_os = "windows")]
    #[error("proto-reg error: {0}")]
    ProtoReg(#[from] proto_reg::Error),
}

pub type Result<T> = std::result::Result<T, Error>;
