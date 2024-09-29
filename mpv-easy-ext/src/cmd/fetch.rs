use std::collections::HashMap;

use reqwest::{
    header::{HeaderMap, HeaderName, HeaderValue},
    Client,
};
use serde::{Deserialize, Serialize};

use super::cli::Cmd;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FetchOption {
    headers: HashMap<String, String>,
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
    let client = Client::new();
    let mut header_map = HeaderMap::new();
    for (k, v) in option.headers {
        header_map.insert(
            HeaderName::from_bytes(k.as_bytes()).unwrap(),
            HeaderValue::from_bytes(v.as_bytes()).unwrap(),
        );
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
