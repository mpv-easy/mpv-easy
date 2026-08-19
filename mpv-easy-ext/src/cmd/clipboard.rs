use super::cli::Cmd;
use crate::error::Result;

#[derive(clap::Parser, Debug)]
pub struct Clipboard {
    #[clap(required = true)]
    cmd: String,

    #[clap(required = false, default_value_t = String::new())]
    text: String,
}

#[cfg(not(target_os = "android"))]
mod clip {
    use clipboard_rs::{Clipboard as _, ClipboardContext, common::RustImage};
    use crate::error::{Error, Result};

    pub fn set_text(text: &str) -> Result<()> {
        let ctx = ClipboardContext::new()
            .map_err(|e| Error::Other(format!("Failed to create clipboard context: {}", e)))?;
        ctx.set_text(text.to_string())
            .map_err(|e| Error::Other(format!("Failed to set text: {}", e)))?;
        Ok(())
    }

    pub fn get_text() -> Result<String> {
        let ctx = ClipboardContext::new()
            .map_err(|e| Error::Other(format!("Failed to create clipboard context: {}", e)))?;
        Ok(ctx
            .get_text()
            .ok()
            .or_else(|| ctx.get_files().ok().map(|v: Vec<String>| v.join("\n")))
            .unwrap_or_default())
    }

    pub fn set_image(path: &str) -> Result<()> {
        let ctx = ClipboardContext::new()
            .map_err(|e| Error::Other(format!("Failed to create clipboard context: {}", e)))?;
        let img = RustImage::from_path(path)
            .map_err(|e| Error::Other(format!("Failed to load image: {}", e)))?;
        ctx.set_image(img)
            .map_err(|e| Error::Other(format!("Failed to set image: {}", e)))?;
        Ok(())
    }
}
#[cfg(target_os = "android")]
mod clip {
    use crate::error::Result;

    pub fn set_text(text: &str) -> Result<()> {
        todo!()
    }

    pub fn get_text() -> Result<String> {
        todo!()
    }

    pub fn set_image(path: &str) -> Result<()> {
        todo!()
    }
}

pub fn get_image() {
    todo!()
}

impl Cmd for Clipboard {
    fn call(&self) -> Result<()> {
        use base64::prelude::*;
        use crate::error::Error;

        let cmd = self.cmd.as_str();

        match cmd {
            "set" => {
                let bin: Vec<u8> = BASE64_STANDARD.decode(&self.text)?;
                let text = String::from_utf8_lossy(&bin);
                clip::set_text(&text)?;
            }
            "get" => {
                let s = clip::get_text()?;
                println!("{}", serde_json::to_string(&s)?);
            }
            "set-image" => {
                let bin: Vec<u8> = BASE64_STANDARD.decode(&self.text)?;
                let text = String::from_utf8_lossy(&bin).to_string();
                clip::set_image(&text)?;
            }
            "get-image" => {
                get_image();
            }
            _ => {
                let text: &str = serde_json::from_str(self.text.as_str())?;
                return Err(Error::Other(format!(
                    "clipboard not support cmd: {} {}",
                    cmd, text
                )));
            }
        }
        Ok(())
    }
}
