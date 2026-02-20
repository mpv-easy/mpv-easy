use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

use anyhow::Context;
use reqwest::Client;

use super::cli::Cmd;

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
    fn call(&self) -> anyhow::Result<()> {
        wget(&self.url, &self.output)
    }
}

#[tokio::main]
async fn wget(url: &str, output: &str) -> anyhow::Result<()> {
    let client = Client::builder()
        .redirect(reqwest::redirect::Policy::default())
        .build()?;

    let resp = client
        .get(url)
        .send()
        .await
        .with_context(|| format!("Failed to fetch URL: {}", url))?;

    if !resp.status().is_success() {
        anyhow::bail!("HTTP error: {} for URL: {}", resp.status(), url);
    }

    let bytes = resp
        .bytes()
        .await
        .with_context(|| format!("Failed to read response body from: {}", url))?;

    let output_path = PathBuf::from(output);
    if let Some(parent) = output_path.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent)
                .with_context(|| format!("Failed to create directory: {}", parent.display()))?;
        }
    }

    let mut file = File::create(&output_path)
        .with_context(|| format!("Failed to create output file: {}", output))?;
    file.write_all(&bytes)
        .with_context(|| format!("Failed to write to file: {}", output))?;

    Ok(())
}
