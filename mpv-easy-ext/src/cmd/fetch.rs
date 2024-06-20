use serde::{Deserialize, Serialize};

use super::cli::Cmd;

#[derive(clap::Parser, Debug)]
pub struct Fetch {
    #[clap(required = true)]
    params: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FetchResponse {
    status: u16,
    text: String,
}

#[tokio::main]
async fn fetch(url: &str) -> Result<(), Box<dyn std::error::Error>> {
    let resp = reqwest::get(url).await?;
    let status = resp.status().as_u16();
    let text = resp.text().await?;
    let r = FetchResponse{
      text,
      status
    };
    println!("{}", serde_json::to_string(&r).unwrap());
    Ok(())
}

impl Cmd for Fetch {
    fn call(&self) {
        let params = self.params.as_str();
        let url: String = serde_json::from_str(self.params.as_str()).unwrap();
        fetch(&url).unwrap();
    }
}
