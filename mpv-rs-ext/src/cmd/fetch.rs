use super::cli::Cmd;

#[derive(clap::Parser, Debug)]
pub struct Fetch {
    #[clap(required = true)]
    params: String,
}
#[tokio::main]
async fn fetch(url: &str) -> Result<(), Box<dyn std::error::Error>> {
    let resp = reqwest::get(url).await?.text().await?;
    println!("{}", serde_json::to_string(&resp).unwrap());
    Ok(())
}

impl Cmd for Fetch {
    fn call(&self) {
        let params = self.params.as_str();
        fetch(params).unwrap();
    }
}
