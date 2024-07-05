use super::cli::Cmd;
use clap::builder::Str;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct User {
    pub Name: String,
    pub ServerId: String,
    pub Id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MediaSource {
    pub Protocol: String,
    pub Id: String,
    pub Path: String,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct PlaybackInfo {
    pub MediaSources: Vec<MediaSource>,
    pub PlaySessionId: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ViewItem {
    pub Name: String,
    pub ServerId: String,
    pub Id: String,
    pub Path: String,
    pub ParentId: String,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct View {
    pub Items: Vec<ViewItem>,
    pub TotalRecordCount: u32,
    pub StartIndex: u32,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct PlayItem {
    pub Name: String,
    // pub ServerId: String,
    pub Id: String,
    pub HasSubtitles: bool,
    pub IsFolder: bool,
    pub Type: String,
    pub LocationType: String,
    pub MediaType: String,
}
#[derive(Debug, Deserialize, Serialize)]
pub struct PlayList {
    pub Items: Vec<PlayItem>,
    pub TotalRecordCount: u32,
    pub StartIndex: u32,
}

#[derive(clap::Parser, Debug)]
pub struct Jellyfin {
    cmd: String,

    host: String,

    api_key: String,

    username: String,

    #[clap(required = false, default_value_t=String::new())]
    id: String,
}

pub fn get_user_id(host: &str, api_key: &str, username: &str) -> Option<String> {
    let url = format!("http://{host}/Users?api_key={api_key}");
    let users = reqwest::blocking::get(url)
        .unwrap()
        .json::<Vec<User>>()
        .unwrap();

    for i in users {
        if i.Name == *username {
            return Some(i.Id);
        }
    }
    None
}
pub fn get_views(host: &str, api_key: &str, user_id: &str) -> Option<View> {
    let url = format!("http://{host}/Users/{user_id}/Views?api_key={api_key}");
    reqwest::blocking::get(url).unwrap().json::<View>().ok()
}

pub fn get_playlist(host: &str, api_key: &str, user_id: &str, parent_id: &str) -> Option<PlayList> {
    let url = format!("http://{host}/Users/{user_id}/Items?ParentId={parent_id}&api_key={api_key}");
    reqwest::blocking::get(url)
        .unwrap()
        .json::<PlayList>()
        .ok()
}

impl Cmd for Jellyfin {
    fn call(&self) {
        let Jellyfin {
            cmd,
            host,
            api_key,
            username,
            id,
        } = self;
        let user_id = get_user_id(host, api_key, username).unwrap();
        match cmd.as_str() {
            "playbackinfo" => {
                let url = format!(
                    "http://{host}/Items/{id}/PlaybackInfo?api_key={api_key}&userid={user_id}"
                );
                let resp = reqwest::blocking::get(url)
                    .unwrap()
                    .json::<PlaybackInfo>()
                    .unwrap();
                println!("{}", serde_json::to_string(&resp).unwrap())
            }
            "playlist" => {
                let list = get_playlist(host, api_key, &user_id, id).unwrap();
                println!("{}", serde_json::to_string(&list).unwrap())
            }
            "userid" => {
                println!("{user_id}")
            }
            "view" => {
                let v = get_views(host, api_key, &user_id).unwrap();
                println!("{}", serde_json::to_string(&v).unwrap());
            }
            _ => {
              todo!()
            }
        }
    }
}
