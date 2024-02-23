use super::ffi::{mpv_error, mpv_error_string};

use std::ffi::{CStr, NulError};
use std::fmt;
use std::str::Utf8Error;

#[derive(Debug)]
pub struct Error(mpv_error);
pub type Result<T> = std::result::Result<T, Error>;

impl Error {
    pub fn new(error: mpv_error) -> Self {
        Self(error)
    }
}

impl From<NulError> for Error {
    fn from(_: NulError) -> Self {
        Self::new(mpv_error::GENERIC)
    }
}

impl From<Utf8Error> for Error {
    fn from(_: Utf8Error) -> Self {
        Self::new(mpv_error::GENERIC)
    }
}

impl std::error::Error for Error {
    fn description(&self) -> &str {
        unsafe {
            CStr::from_ptr(mpv_error_string(self.0))
                .to_str()
                .unwrap_or("unknow error")
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let error = unsafe {
            CStr::from_ptr(mpv_error_string(self.0))
                .to_str()
                .unwrap_or("unknown error")
        };
        write!(f, "[{}] {}", self.0 as i32, error)
    }
}
