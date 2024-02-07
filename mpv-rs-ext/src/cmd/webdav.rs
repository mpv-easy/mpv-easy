use super::cli::Cmd;
use reqwest::{header, Method, Url};
use serde_xml_rs::from_str;

use webdav_serde::Multistatus;

#[derive(clap::Parser, Debug)]
pub struct Webdav {
    #[clap(required = true)]
    cmd: String,

    #[clap(required = true)]
    url: String,
}

fn custom_header(name: &str, value: &str) -> header::HeaderMap {
    let mut headers = header::HeaderMap::new();
    headers.insert(
        header::HeaderName::from_bytes(name.as_bytes()).unwrap(),
        header::HeaderValue::from_bytes(value.as_bytes()).unwrap(),
    );
    headers
}
#[tokio::main]
async fn fetch_remote(path: &str) -> Multistatus {
    let c = reqwest::Client::new();
    let body = r#"<?xml version="1.0" encoding="utf-8" ?>
            <D:propfind xmlns:D="DAV:">
                <D:allprop/>
            </D:propfind>
        "#;
    let method = Method::from_bytes(b"PROPFIND").unwrap();
    let depth = "1";
    let resp = c
        .request(method, Url::parse(path).unwrap())
        .headers(custom_header("depth", depth))
        .body(body)
        .send()
        .await
        .unwrap();

    let xml = resp.text().await.unwrap();
    let status: Multistatus = from_str(&xml).unwrap();
    status
}

impl Cmd for Webdav {
    fn call(&self) {
        let cmd = self.cmd.as_str();
        let url = serde_json::from_str(self.url.as_str()).unwrap();

        match cmd {
            "list" => {
                let status = fetch_remote(url);
                let s = serde_json::to_string(&status).unwrap();
                println!("{}", s);
            }
            _ => {
                panic!("webdav not support cmd: {} {}", cmd, url)
            }
        }
    }
}
