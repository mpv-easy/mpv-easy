use std::io::{Cursor, SeekFrom};
use std::io::{Read, Seek};

use clipboard_win::{
    formats::{self},
    get_clipboard, set_clipboard,
};
use image::{guess_format, ImageFormat};

pub fn set_text(text: &str) {
    set_clipboard(formats::Unicode, text).expect("To set clipboard");
}

pub fn get_text() -> String {
    get_clipboard(formats::Unicode).expect("To set clipboard")
}

pub fn set_image(path: &str) {
    let file_buf = std::fs::read(path).expect("read image file error");
    let fmt = guess_format(&file_buf).expect("image format error");
    let img = image::load_from_memory_with_format(&file_buf, fmt).expect("image load error");
    let mut cursor = Cursor::new(Vec::new());
    img.write_to(&mut cursor, ImageFormat::Bmp)
        .expect("image to bmp error");
    cursor.seek(SeekFrom::Start(0)).unwrap();
    let mut buffer = Vec::new();
    cursor.read_to_end(&mut buffer).unwrap();
    set_clipboard(formats::Bitmap, buffer).expect("copy to clipboard error");
}
pub fn get_image() {
    todo!()
}
