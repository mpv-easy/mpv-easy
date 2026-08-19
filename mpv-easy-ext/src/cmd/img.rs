use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

use image::{DynamicImage, GenericImageView};

use super::cli::Cmd;
use crate::error::{Error, Result};

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
    fn call(&self) -> Result<()> {
        img(&self.input, &self.output, self.width, self.height)
    }
}

pub fn img(input: &str, output: &str, target_width: Option<u32>, target_height: Option<u32>) -> Result<()> {
    let data = std::fs::read(input)
        .map_err(|e| Error::Other(format!("Failed to read image file: {}: {}", input, e)))?;
    let img = image::load_from_memory(&data).map_err(|e| {
        Error::Other(format!("Failed to decode image (guessed from content): {}: {}", input, e))
    })?;

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
            for chunk in rgba.as_chunks::<4>().0 {
                // RGBA -> BGRA
                bgra.push(chunk[2]); // B
                bgra.push(chunk[1]); // G
                bgra.push(chunk[0]); // R
                bgra.push(chunk[3]); // A
            }
            let mut file = File::create(&output_path).map_err(|e| {
                Error::Other(format!("Failed to create output file: {}: {}", output, e))
            })?;
            file.write_all(&bgra)?;
        }
        _ => {
            img.save(&output_path)
                .map_err(|e| Error::Other(format!("Failed to save image to: {}: {}", output, e)))?;
        }
    }

    // Print dimensions so the caller knows the actual image size
    println!("{} {}", width, height);

    Ok(())
}
