use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("UTF-8 error: {0}")]
    Utf8(#[from] std::string::FromUtf8Error),
    #[error("Parse error: {0}")]
    Parse(#[from] std::num::ParseIntError),
    #[error("Base64 decode error: {0}")]
    Base64(#[from] base64::DecodeError),
    #[error("HTTP request error: {0}")]
    Reqwest(#[from] reqwest::Error),
    #[error("Invalid header name: {0}")]
    InvalidHeaderName(#[from] reqwest::header::InvalidHeaderName),
    #[error("Invalid header value: {0}")]
    InvalidHeaderValue(#[from] reqwest::header::InvalidHeaderValue),
    #[error("MPV error: {0}")]
    Mpv(String),
    #[error("Other error: {0}")]
    Other(String),
    // `proto-reg` and `consolex` are Windows-only dependencies.
    #[cfg(target_os = "windows")]
    #[error("proto-reg error: {0}")]
    ProtoReg(#[from] proto_reg::Error),
    #[cfg(target_os = "windows")]
    #[error("consolex error: {0}")]
    Consolex(#[from] consolex::Error),
}

pub type Result<T> = std::result::Result<T, Error>;
