use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

use reqwest::Client;

use super::cli::Cmd;
use crate::error::{Error, Result};

#[derive(clap::Parser, Debug)]
pub struct Wget {
    /// URL to download
    #[clap(required = true)]
    url: String,

    /// Output file path
    #[clap(required = true)]
    output: String,
}

impl Cmd for Wget {
    fn call(&self) -> Result<()> {
        wget(&self.url, &self.output)
    }
}

#[tokio::main]
async fn wget(url: &str, output: &str) -> Result<()> {
    let client = Client::builder()
        .redirect(reqwest::redirect::Policy::default())
        .build()?;

    let resp = client
        .get(url)
        .send()
        .await
        .map_err(|e| Error::Other(format!("Failed to fetch URL: {}: {}", url, e)))?;

    if !resp.status().is_success() {
        return Err(Error::Other(format!("HTTP error: {} for URL: {}", resp.status(), url)));
    }

    let bytes = resp
        .bytes()
        .await
        .map_err(|e| Error::Other(format!("Failed to read response body from: {}: {}", url, e)))?;

    let output_path = PathBuf::from(output);
    if let Some(parent) = output_path.parent()
        && !parent.exists() {
            std::fs::create_dir_all(parent).map_err(|e| {
                Error::Other(format!("Failed to create directory: {}: {}", parent.display(), e))
            })?;
        }

    let mut file = File::create(&output_path).map_err(|e| {
        Error::Other(format!("Failed to create output file: {}: {}", output, e))
    })?;
    file.write_all(&bytes)
        .map_err(|e| Error::Other(format!("Failed to write to file: {}: {}", output, e)))?;

    Ok(())
}
