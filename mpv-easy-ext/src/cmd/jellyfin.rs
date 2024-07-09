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

pub fn get_user_id(server: &str, api_key: &str, username: &str) -> Option<String> {
    let url = format!("{server}/Users?api_key={api_key}");
    let users = reqwest::blocking::get(url)
        .unwrap()
        .json::<Vec<UserDto>>()
        .unwrap();

    for i in users {
        if let (Some(name), Some(id)) = (i.name, i.id) {
            if name == username {
                return Some(id);
            }
        };
    }
    None
}
pub fn get_views(server: &str, api_key: &str, user_id: &str) -> Option<BaseItemDtoQueryResult> {
    let url = format!("{server}/Users/{user_id}/Views?api_key={api_key}");
    reqwest::blocking::get(url)
        .unwrap()
        .json::<BaseItemDtoQueryResult>()
        .ok()
}

pub fn get_list_by_parent_id(
    server: &str,
    api_key: &str,
    user_id: &str,
    parent_id: &str,
) -> Option<BaseItemDtoQueryResult> {
    let url = format!("{server}/Users/{user_id}/Items?ParentId={parent_id}&api_key={api_key}");
    reqwest::blocking::get(url)
        .unwrap()
        .json::<BaseItemDtoQueryResult>()
        .ok()
}

impl Cmd for Jellyfin {
    fn call(&self) {
        let Jellyfin {
            cmd,
            server,
            api_key,
            username,
            id,
        } = self;
        let user_id = get_user_id(server, api_key, username).unwrap();
        match cmd.as_str() {
            "playbackinfo" => {
                let url =
                    format!("{server}/Items/{id}/PlaybackInfo?api_key={api_key}&userid={user_id}");
                let resp = reqwest::blocking::get(url)
                    .unwrap()
                    .json::<PlaybackInfoResponse>()
                    .unwrap();
                println!("{}", serde_json::to_string(&resp).unwrap())
            }
            "playlist" => {
                let list = get_list_by_parent_id(server, api_key, &user_id, id).unwrap();
                println!("{}", serde_json::to_string(&list).unwrap())
            }
            "userid" => {
                println!("{user_id}")
            }
            "view" => {
                let v = get_views(server, api_key, &user_id).unwrap();
                println!("{}", serde_json::to_string(&v).unwrap());
            }
            _ => {
                todo!()
            }
        }
    }
}
