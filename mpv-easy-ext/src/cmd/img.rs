use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

use anyhow::Context;
use image::GenericImageView;

use super::cli::Cmd;

#[derive(clap::Parser, Debug)]
pub struct Img {
    #[clap(required = true)]
    input: String,

    #[clap(required = true)]
    output: String,
}

impl Cmd for Img {
    fn call(&self) -> anyhow::Result<()> {
        img(&self.input, &self.output)
    }
}

pub fn img(input: &str, output: &str) -> anyhow::Result<()> {
    let img = image::open(input)
        .with_context(|| format!("Failed to open image: {}", input))?;

    let output_path = PathBuf::from(output);
    let extension = output_path
        .extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_lowercase());

    match extension.as_deref() {
        Some("bgra") => {
            let (width, height) = img.dimensions();
            let rgba = img.to_rgba8();
            let mut bgra = Vec::with_capacity((width * height * 4) as usize);
            for chunk in rgba.chunks_exact(4) {
                // RGBA -> BGRA
                bgra.push(chunk[2]); // B
                bgra.push(chunk[1]); // G
                bgra.push(chunk[0]); // R
                bgra.push(chunk[3]); // A
            }
            let mut file = File::create(&output_path)
                .with_context(|| format!("Failed to create output file: {}", output))?;
            file.write_all(&bgra)?;
        }
        _ => {
            img.save(&output_path)
                .with_context(|| format!("Failed to save image to: {}", output))?;
        }
    }

    Ok(())
}
