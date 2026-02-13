use super::cli::Cmd;
use serde_jellyfin::{
    base_item_dto_query_result::BaseItemDtoQueryResult,
    playback_info_response::PlaybackInfoResponse, user_dto::UserDto,
};

#[derive(clap::Parser, Debug)]
pub struct Jellyfin {
    cmd: String,

    server: String,

    api_key: String,

    username: String,

    #[clap(required = false, default_value_t=String::new())]
    id: String,
}

pub fn get_user_id(server: &str, api_key: &str, username: &str) -> anyhow::Result<Option<String>> {
    let url = format!("{server}/Users?api_key={api_key}");
    let users = reqwest::blocking::get(url)?
        .json::<Vec<UserDto>>()?;

    for i in users {
        if let (Some(name), Some(id)) = (i.name, i.id)
            && name == username
        {
            return Ok(Some(id));
        };
    }
    Ok(None)
}
pub fn get_views(server: &str, api_key: &str, user_id: &str) -> anyhow::Result<BaseItemDtoQueryResult> {
    let url = format!("{server}/Users/{user_id}/Views?api_key={api_key}");
    let res = reqwest::blocking::get(url)?
        .json::<BaseItemDtoQueryResult>()?;
    Ok(res)
}

pub fn get_list_by_parent_id(
    server: &str,
    api_key: &str,
    user_id: &str,
    parent_id: &str,
) -> anyhow::Result<BaseItemDtoQueryResult> {
    let url = format!("{server}/Users/{user_id}/Items?ParentId={parent_id}&api_key={api_key}");
    let res = reqwest::blocking::get(url)?
        .json::<BaseItemDtoQueryResult>()?;
    Ok(res)
}

impl Cmd for Jellyfin {
    fn call(&self) -> anyhow::Result<()> {
        let Jellyfin {
            cmd,
            server,
            api_key,
            username,
            id,
        } = self;
        let user_id = get_user_id(server, api_key, username)?
            .ok_or_else(|| anyhow::anyhow!("User not found"))?;
        match cmd.as_str() {
            "playbackinfo" => {
                let url =
                    format!("{server}/Items/{id}/PlaybackInfo?api_key={api_key}&userid={user_id}");
                let resp = reqwest::blocking::get(url)?
                    .json::<PlaybackInfoResponse>()?;
                println!("{}", serde_json::to_string(&resp).map_err(anyhow::Error::from)?);
            }
            "playlist" => {
                let list = get_list_by_parent_id(server, api_key, &user_id, id)?;
                println!("{}", serde_json::to_string(&list).map_err(anyhow::Error::from)?);
            }
            "userid" => {
                println!("{user_id}");
            }
            "view" => {
                let v = get_views(server, api_key, &user_id)?;
                println!("{}", serde_json::to_string(&v).map_err(anyhow::Error::from)?);
            }
            _ => {
                anyhow::bail!("Unsupported command");
            }
        }
        Ok(())
    }
}
