use std::collections::HashMap;

use reqwest::{
    Client,
    header::{HeaderMap, HeaderName, HeaderValue},
    redirect::Policy,
};
use serde::{Deserialize, Serialize};

use super::cli::Cmd;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FetchOption {
    headers: Option<HashMap<String, String>>,
    redirect: Option<String>,
}

#[derive(clap::Parser, Debug, Clone, Serialize, Deserialize, Default)]
pub struct Fetch {
    #[clap(required = true)]
    params: String,
    #[clap(required = false)]
    option: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FetchResponse {
    status: u16,
    text: String,
}

#[tokio::main]
async fn fetch(url: &str, option: FetchOption) -> Result<(), Box<dyn std::error::Error>> {
    let client = match option.redirect {
        Some(r) => match r.as_str() {
            "follow" => Client::builder().redirect(Policy::default()).build()?,
            "manual" => Client::builder()
                .redirect(Policy::custom(|attempt| {
                    if attempt.previous().len() > 1 {
                        attempt.stop()
                    } else {
                        attempt.follow()
                    }
                }))
                .build()?,
            "error" => Client::builder().redirect(Policy::none()).build()?,
            _ => panic!("redirect value is invalid"),
        },
        None => Client::builder().redirect(Policy::default()).build()?,
    };
    let mut header_map = HeaderMap::new();
    if let Some(headers) = option.headers {
        for (k, v) in headers {
            header_map.insert(
                HeaderName::from_bytes(k.as_bytes()).unwrap(),
                HeaderValue::from_bytes(v.as_bytes()).unwrap(),
            );
        }
    }
    let resp = client.get(url).headers(header_map).send().await?;
    let status = resp.status().as_u16();
    let text = resp.text().await?;
    let r = FetchResponse { text, status };
    println!("{}", serde_json::to_string(&r).unwrap());
    Ok(())
}

impl Cmd for Fetch {
    fn call(&self) {
        let url: String = serde_json::from_str(self.params.as_str()).unwrap();
        let option: FetchOption = match self.option {
            Some(ref s) => serde_json::from_str(s.as_str()).unwrap(),
            None => Default::default(),
        };
        fetch(&url, option).unwrap();
    }
}
