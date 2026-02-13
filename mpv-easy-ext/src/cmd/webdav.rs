use super::cli::Cmd;
use base64::{Engine, prelude::BASE64_STANDARD};
use reqwest::{Method, Url, header};
use serde_xml_rs::from_str;

use webdav_serde::Multistatus;

#[derive(clap::Parser, Debug)]
pub struct Webdav {
    #[clap(required = true)]
    cmd: String,

    #[clap(required = true)]
    url: String,

    #[clap(required = false)]
    auth: Option<String>,
}

fn custom_header(name: &str, value: &str) -> anyhow::Result<header::HeaderMap> {
    let mut headers = header::HeaderMap::new();
    headers.insert(
        header::HeaderName::from_bytes(name.as_bytes())?,
        header::HeaderValue::from_bytes(value.as_bytes())?,
    );
    Ok(headers)
}

#[tokio::main]
async fn fetch_remote(path: &str, auth: Option<String>) -> anyhow::Result<Multistatus> {
    let c = reqwest::Client::new();
    let body = r#"<?xml version="1.0" encoding="utf-8" ?>
            <D:propfind xmlns:D="DAV:">
                <D:allprop/>
            </D:propfind>
        "#;
    let method = Method::from_bytes(b"PROPFIND")?;
    let depth = "1";
    let mut resp = c
        .request(method, Url::parse(path)?)
        .headers(custom_header("depth", depth)?);

    if let Some(auth) = auth {
        let b64 = BASE64_STANDARD.encode(&auth);
        let s = format!("Basic {}", b64);
        resp = resp.headers(custom_header("Authorization", &s)?)
    }

    let resp = resp.body(body).send().await?;
    let xml = resp.text().await?;
    let status: Multistatus = from_str(&xml)?;
    Ok(status)
}

impl Cmd for Webdav {
    fn call(&self) -> anyhow::Result<()> {
        let Webdav { cmd, auth, url } = self;

        let url: String = serde_json::from_str(url)?;
        let auth: Option<String> = match auth {
            Some(i) => Some(serde_json::from_str::<String>(i)?),
            None => None,
        };

        match cmd.as_str() {
            "list" => {
                let status = fetch_remote(&url, auth)?;
                let s = serde_json::to_string(&status)?;
                println!("{}", s);
            }
            _ => {
                anyhow::bail!("webdav not support cmd: {} {}", cmd, url);
            }
        }
        Ok(())
    }
}
