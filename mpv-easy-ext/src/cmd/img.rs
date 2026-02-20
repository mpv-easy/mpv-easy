use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

use anyhow::Context;
use image::{DynamicImage, GenericImageView};

use super::cli::Cmd;

#[derive(clap::Parser, Debug)]
pub struct Img {
    #[clap(required = true)]
    input: String,

    #[clap(required = true)]
    output: String,

    /// Optional target width for resizing. If only width is set, height is calculated to preserve aspect ratio.
    #[clap(long)]
    width: Option<u32>,

    /// Optional target height for resizing. If only height is set, width is calculated to preserve aspect ratio.
    #[clap(long)]
    height: Option<u32>,
}

impl Cmd for Img {
    fn call(&self) -> anyhow::Result<()> {
        img(&self.input, &self.output, self.width, self.height)
    }
}

pub fn img(input: &str, output: &str, target_width: Option<u32>, target_height: Option<u32>) -> anyhow::Result<()> {
    let data = std::fs::read(input)
        .with_context(|| format!("Failed to read image file: {}", input))?;
    let img = image::load_from_memory(&data)
        .with_context(|| format!("Failed to decode image (guessed from content): {}", input))?;

    let (orig_w, orig_h) = img.dimensions();

    // Resize if width and/or height are specified
    let img: DynamicImage = match (target_width, target_height) {
        (Some(w), Some(h)) => img.resize_exact(w, h, image::imageops::FilterType::Lanczos3),
        (Some(w), None) => {
            let h = ((orig_h as f64 / orig_w as f64) * w as f64).round() as u32;
            img.resize_exact(w, h, image::imageops::FilterType::Lanczos3)
        }
        (None, Some(h)) => {
            let w = ((orig_w as f64 / orig_h as f64) * h as f64).round() as u32;
            img.resize_exact(w, h, image::imageops::FilterType::Lanczos3)
        }
        (None, None) => img,
    };

    let (width, height) = img.dimensions();
    let output_path = PathBuf::from(output);
    let extension = output_path
        .extension()
        .and_then(|s| s.to_str())
        .map(|s| s.to_lowercase());

    match extension.as_deref() {
        Some("bgra") => {
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

    // Print dimensions so the caller knows the actual image size
    println!("{} {}", width, height);

    Ok(())
}
