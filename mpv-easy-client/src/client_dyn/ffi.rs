#![allow(non_upper_case_globals)]

use std::ffi::{c_char, c_double, c_int, c_longlong, c_ulonglong, c_void};

use libloading::{Library, Symbol};
use once_cell::sync::Lazy;

use crate::bindgen::client::mpv_node;

type LazySymbol<T> = Lazy<Symbol<'static, T>>;

pub static MPV_LIB: Lazy<Library> = Lazy::new(|| unsafe { Library::new("mpv.exe").unwrap() });

pub static mpv_error_string: LazySymbol<unsafe extern "C" fn(mpv_error) -> *const c_char> =
    Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_error_string").unwrap() });

pub static mpv_free: LazySymbol<unsafe extern "C" fn(*mut c_void) -> ()> =
    Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_free").unwrap() });

pub static mpv_client_name: LazySymbol<unsafe extern "C" fn(*mut mpv_handle) -> *const c_char> =
    Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_client_name").unwrap() });

pub static mpv_client_id: LazySymbol<unsafe extern "C" fn(*mut mpv_handle) -> c_longlong> =
    Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_client_id").unwrap() });

pub static mpv_create: LazySymbol<unsafe extern "C" fn() -> *mut mpv_handle> =
    Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_create").unwrap() });

pub static mpv_initialize: LazySymbol<unsafe extern "C" fn(*mut mpv_handle) -> mpv_error> =
    Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_initialize").unwrap() });

pub static mpv_destroy: LazySymbol<unsafe extern "C" fn(*mut mpv_handle) -> ()> =
    Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_destroy").unwrap() });

pub static mpv_create_client: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, *const c_char) -> *mut mpv_handle,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_create_client").unwrap() });

pub static mpv_create_weak_client: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, *const c_char) -> *mut mpv_handle,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_create_weak_client").unwrap() });

pub static mpv_command: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, *const *const c_char) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_command").unwrap() });

pub static mpv_command_node: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, *const mpv_node, *const mpv_node) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_command_node").unwrap() });

pub static mpv_command_string: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, *const c_char) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_command_string").unwrap() });

pub static mpv_command_async: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, c_ulonglong, *const *const c_char) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_command_async").unwrap() });

pub static mpv_set_property: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, *const c_char, c_int, *const c_void) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_set_property").unwrap() });

pub static mpv_get_property: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, *const c_char, c_int, *const c_void) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_get_property").unwrap() });

pub static mpv_observe_property: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, c_ulonglong, *const c_char, c_int) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_observe_property").unwrap() });

pub static mpv_unobserve_property: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, c_ulonglong) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_unobserve_property").unwrap() });

pub static mpv_event_name: LazySymbol<unsafe extern "C" fn(mpv_event_id) -> *const c_char> =
    Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_event_name").unwrap() });

pub static mpv_wait_event: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, c_double) -> *mut mpv_event,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_wait_event").unwrap() });

pub static mpv_hook_add: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, c_ulonglong, *const c_char, c_int) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_hook_add").unwrap() });

pub static mpv_hook_continue: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, c_ulonglong) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_hook_continue").unwrap() });

pub static mpv_request_event: LazySymbol<
    unsafe extern "C" fn(*mut mpv_handle, c_int, c_int) -> mpv_error,
> = Lazy::new(|| unsafe { MPV_LIB.get(b"mpv_request_event").unwrap() });

#[repr(i32)]
#[allow(dead_code)]
#[allow(non_camel_case_types)]
#[derive(Copy, Clone, PartialEq, Debug)]
pub enum mpv_error {
    SUCCESS = 0,
    EVENT_QUEUE_FULL = -1,
    NOMEM = -2,
    UNINITIALIZED = -3,
    INVALID_PARAMETER = -4,
    OPTION_NOT_FOUND = -5,
    OPTION_FORMAT = -6,
    OPTION_ERROR = -7,
    PROPERTY_NOT_FOUND = -8,
    PROPERTY_FORMAT = -9,
    PROPERTY_UNAVAILABLE = -10,
    PROPERTY_ERROR = -11,
    COMMAND = -12,
    LOADING_FAILED = -13,
    AO_INIT_FAILED = -14,
    VO_INIT_FAILED = -15,
    NOTHING_TO_PLAY = -16,
    UNKNOWN_FORMAT = -17,
    UNSUPPORTED = -18,
    NOT_IMPLEMENTED = -19,
    GENERIC = -20,
}

#[repr(i32)]
#[allow(dead_code)]
#[allow(non_camel_case_types)]
#[derive(Copy, Clone, PartialEq)]
pub enum mpv_event_id {
    NONE = 0,
    SHUTDOWN = 1,
    LOG_MESSAGE = 2,
    GET_PROPERTY_REPLY = 3,
    SET_PROPERTY_REPLY = 4,
    COMMAND_REPLY = 5,
    START_FILE = 6,
    END_FILE = 7,
    FILE_LOADED = 8,
    CLIENT_MESSAGE = 16,
    VIDEO_RECONFIG = 17,
    AUDIO_RECONFIG = 18,
    SEEK = 20,
    PLAYBACK_RESTART = 21,
    PROPERTY_CHANGE = 22,
    QUEUE_OVERFLOW = 24,
    HOOK = 25,
}

#[repr(i32)]
#[allow(dead_code)]
#[allow(non_camel_case_types)]
#[derive(Copy, Clone, PartialEq)]
pub enum mpv_log_level {
    MPV_LOG_LEVEL_NONE = 0,
    MPV_LOG_LEVEL_FATAL = 10,
    MPV_LOG_LEVEL_ERROR = 20,
    MPV_LOG_LEVEL_WARN = 30,
    MPV_LOG_LEVEL_INFO = 40,
    MPV_LOG_LEVEL_V = 50,
    MPV_LOG_LEVEL_DEBUG = 60,
    MPV_LOG_LEVEL_TRACE = 70,
}

#[repr(i32)]
#[allow(dead_code)]
#[allow(non_camel_case_types)]
#[derive(Copy, Clone, PartialEq)]
pub enum mpv_end_file_reason {
    MPV_END_FILE_REASON_EOF = 0,
    MPV_END_FILE_REASON_STOP = 2,
    MPV_END_FILE_REASON_QUIT = 3,
    MPV_END_FILE_REASON_ERROR = 4,
    MPV_END_FILE_REASON_REDIRECT = 5,
}

/// Raw client context.
#[allow(non_camel_case_types)]
pub type mpv_handle = c_void;

#[repr(C)]
#[allow(non_camel_case_types)]
pub struct mpv_event_property {
    pub name: *const c_char,
    pub format: i32,
    pub data: *mut c_void,
}

#[repr(C)]
#[allow(non_camel_case_types)]
pub struct mpv_event_log_message {
    pub prefix: *const c_char,
    pub level: *const c_char,
    pub text: *const c_char,
    pub log_level: mpv_log_level,
}

#[repr(C)]
#[allow(non_camel_case_types)]
pub struct mpv_event_start_file {
    pub playlist_entry_id: c_ulonglong,
}

#[repr(C)]
#[allow(non_camel_case_types)]
pub struct mpv_event_end_file {
    pub reason: mpv_end_file_reason,
    pub error: c_int,
    pub playlist_entry_id: c_ulonglong,
    pub playlist_insert_id: c_ulonglong,
    pub playlist_insert_num_entries: c_int,
}

#[repr(C)]
#[allow(non_camel_case_types)]
pub struct mpv_event_client_message {
    pub num_args: c_int,
    pub args: *const *const c_char,
}

#[repr(C)]
#[allow(non_camel_case_types)]
pub struct mpv_event_hook {
    pub name: *const c_char,
    pub id: c_ulonglong,
}

#[repr(C)]
#[allow(non_camel_case_types)]
pub struct mpv_event {
    pub event_id: mpv_event_id,
    pub error: mpv_error,
    pub reply_userdata: c_ulonglong,
    pub data: *mut c_void,
}
