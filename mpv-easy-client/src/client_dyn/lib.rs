use std::ffi::{c_char, c_void, CStr, CString};
use std::fmt;
use std::ops::{Deref, DerefMut};
use std::os::raw::c_int;
use std::ptr::slice_from_raw_parts_mut;

use crate::api::{mpv_format_MPV_FORMAT_DOUBLE, mpv_format_MPV_FORMAT_FLAG};
use crate::bindgen::client::{
    mpv_format_MPV_FORMAT_INT64, mpv_format_MPV_FORMAT_NODE_ARRAY, mpv_format_MPV_FORMAT_STRING,
    mpv_node, mpv_node__bindgen_ty_1, mpv_node_list,
};
use crate::client_dyn::common::mpv_node_to_json;
// use crate::bindgen::client::{mpv_client_id, mpv_client_name, mpv_create_client, mpv_create_weak_client, mpv_event_log_message, mpv_event_name, mpv_event_property, mpv_event_start_file, mpv_wait_event};
use crate::client_dyn::ffi::{
    mpv_command, mpv_command_async, mpv_command_string, mpv_event_client_message,
    mpv_event_end_file, mpv_event_hook, mpv_event_log_message, mpv_event_property,
    mpv_event_start_file, mpv_get_property, mpv_hook_add, mpv_hook_continue, mpv_initialize,
    mpv_observe_property, mpv_request_event, mpv_set_property, mpv_unobserve_property,
};

pub use crate::client_dyn::error::{Error, Result};

/// Representation of a borrowed client context used by the client API.
/// Every client has its own private handle.
pub struct Handle {
    inner: [mpv_handle],
}

/// A type representing an owned client context.
pub struct Client(*mut mpv_handle);

/// An enum representing the available events that can be received by
/// `Handle::wait_event`.
pub enum Event {
    /// Nothing happened. Happens on timeouts or sporadic wakeups.
    None,
    /// Happens when the player quits. The player enters a state where it tries
    /// to disconnect all clients.
    Shutdown,
    /// See `Handle::request_log_messages`.
    /// See also `LogMessage`.
    LogMessage(LogMessage),
    /// Reply to a `Handle::get_property_async` request.
    /// See also `Property`.
    GetPropertyReply(Result<()>, u64, Property),
    /// Reply to a `Handle::set_property_async` request.
    /// (Unlike `GetPropertyReply`, `Property` is not used.)
    SetPropertyReply(Result<()>, u64),
    /// Reply to a `Handle::command_async` or mpv_command_node_async() request.
    /// See also `Command`.
    CommandReply(Result<()>, u64), // TODO mpv_event_command and mpv_node
    /// Notification before playback start of a file (before the file is loaded).
    /// See also `StartFile`.
    StartFile(StartFile),
    /// Notification after playback end (after the file was unloaded).
    /// See also `EndFile`.
    EndFile(EndFile),
    /// Notification when the file has been loaded (headers were read etc.), and
    /// decoding starts.
    FileLoaded,
    /// Triggered by the script-message input command. The command uses the
    /// first argument of the command as client name (see `Handle::client_name`) to
    /// dispatch the message, and passes along all arguments starting from the
    /// second argument as strings.
    /// See also `ClientMessage`.
    ClientMessage(ClientMessage),
    /// Happens after video changed in some way. This can happen on resolution
    /// changes, pixel format changes, or video filter changes. The event is
    /// sent after the video filters and the VO are reconfigured. Applications
    /// embedding a mpv window should listen to this event in order to resize
    /// the window if needed.
    /// Note that this event can happen sporadically, and you should check
    /// yourself whether the video parameters really changed before doing
    /// something expensive.
    VideoReconfig,
    /// Similar to `VideoReconfig`. This is relatively uninteresting,
    /// because there is no such thing as audio output embedding.
    AudioReconfig,
    /// Happens when a seek was initiated. Playback stops. Usually it will
    /// resume with `PlaybackRestart` as soon as the seek is finished.
    Seek,
    /// There was a discontinuity of some sort (like a seek), and playback
    /// was reinitialized. Usually happens on start of playback and after
    /// seeking. The main purpose is allowing the client to detect when a seek
    /// request is finished.
    PlaybackRestart,
    /// Event sent due to `mpv_observe_property()`.
    /// See also `Property`.
    PropertyChange(u64, Property),
    /// Happens if the internal per-mpv_handle ringbuffer overflows, and at
    /// least 1 event had to be dropped. This can happen if the client doesn't
    /// read the event queue quickly enough with `Handle::wait_event`, or if the
    /// client makes a very large number of asynchronous calls at once.
    ///
    /// Event delivery will continue normally once this event was returned
    /// (this forces the client to empty the queue completely).
    QueueOverflow,
    /// Triggered if a hook handler was registered with `Handle::hook_add`, and the
    /// hook is invoked. If you receive this, you must handle it, and continue
    /// the hook with `Handle::hook_continue`.
    /// See also `Hook`.
    Hook(u64, Hook),
}

/// Data associated with `Event::GetPropertyReply` and `Event::PropertyChange`.
pub struct Property(*const mpv_event_property);

/// Data associated with `Event::LogMessage`.
pub struct LogMessage(*const mpv_event_log_message);

/// Data associated with `Event::StartFile`.
pub struct StartFile(*const mpv_event_start_file);

/// Data associated with `Event::EndFile`.
pub struct EndFile(*const mpv_event_end_file);

/// Data associated with `Event::ClientMessage`.
pub struct ClientMessage(*const mpv_event_client_message);

/// Data associated with `Event::Hook`.
pub struct Hook(*const mpv_event_hook);
use super::ffi::{
    mpv_client_id, mpv_client_name, mpv_command_node, mpv_create, mpv_create_client,
    mpv_create_weak_client, mpv_destroy, mpv_error, mpv_event, mpv_event_id, mpv_event_name,
    mpv_handle, mpv_wait_event,
};
use super::format::Format;

macro_rules! result {
    ($f:expr) => {
        match $f {
            mpv_error::SUCCESS => Ok(()),
            e => Err(Error::new(e)),
        }
    };
}

#[macro_export]
macro_rules! osd {
    ($client:expr, $duration:expr, $($arg:tt)*) => {
        $client.command(&["show-text", &format!($($arg)*), &$duration.as_millis().to_string()])
    }
}

#[macro_export]
macro_rules! osd_async {
    ($client:expr, $reply:expr, $duration:expr, $($arg:tt)*) => {
        $client.command_async($reply, &["show-text", &format!($($arg)*), &$duration.as_millis().to_string()])
    }
}

impl Handle {
    /// Wrap a raw mpv_handle
    ///
    /// This function will wrap the provided `ptr` with a `Handle` wrapper, which
    /// allows inspection and interoperation of non-owned `mpv_handle`.
    ///
    /// # Safety
    ///
    /// * `ptr` must be non null.
    ///
    /// * The memory referenced by the returned `Handle` must not be freed for
    ///   the duration of lifetime `'a`.
    #[inline]
    pub fn from_ptr<'a>(ptr: *mut mpv_handle) -> &'a mut Self {
        unsafe { &mut *(slice_from_raw_parts_mut(ptr, 1) as *mut Self) }
    }

    #[inline]
    pub unsafe fn as_ptr(&self) -> *const mpv_handle {
        self.inner.as_ptr()
    }

    #[inline]
    pub unsafe fn as_mut_ptr(&mut self) -> *mut mpv_handle {
        self.inner.as_mut_ptr()
    }

    pub fn create_client<S: AsRef<str>>(&mut self, name: S) -> Result<Client> {
        let name = CString::new(name.as_ref())?;
        let handle = unsafe { mpv_create_client(self.as_mut_ptr(), name.as_ptr()) };
        if handle.is_null() {
            Err(Error::new(mpv_error::NOMEM))
        } else {
            Ok(Client(handle))
        }
    }

    pub fn create_weak_client<S: AsRef<str>>(&mut self, name: S) -> Result<Client> {
        let name = CString::new(name.as_ref())?;
        let handle = unsafe { mpv_create_weak_client(self.as_mut_ptr(), name.as_ptr()) };
        if handle.is_null() {
            Err(Error::new(mpv_error::NOMEM))
        } else {
            Ok(Client(handle))
        }
    }

    pub fn initialize(&mut self) -> Result<()> {
        unsafe { result!(mpv_initialize(self.as_mut_ptr())) }
    }

    /// Wait for the next event, or until the timeout expires, or if another thread
    /// makes a call to `mpv_wakeup()`. Passing 0 as timeout will never wait, and
    /// is suitable for polling.
    ///
    /// The internal event queue has a limited size (per client handle). If you
    /// don't empty the event queue quickly enough with `Handle::wait_event`, it will
    /// overflow and silently discard further events. If this happens, making
    /// asynchronous requests will fail as well (with MPV_ERROR_EVENT_QUEUE_FULL).
    ///
    /// Only one thread is allowed to call this on the same `Handle` at a time.
    /// The API won't complain if more than one thread calls this, but it will cause
    /// race conditions in the client when accessing the shared mpv_event struct.
    /// Note that most other API functions are not restricted by this, and no API
    /// function internally calls `mpv_wait_event()`. Additionally, concurrent calls
    /// to different handles are always safe.
    ///
    /// As long as the timeout is 0, this is safe to be called from mpv render API
    /// threads.
    pub fn wait_event(&mut self, timeout: f64) -> Event {
        unsafe { Event::from_ptr(mpv_wait_event(self.as_mut_ptr(), timeout)) }
    }

    /// Return the name of this client handle. Every client has its own unique
    /// name, which is mostly used for user interface purposes.
    pub fn name<'a>(&mut self) -> &'a str {
        unsafe {
            CStr::from_ptr(mpv_client_name(self.as_mut_ptr()))
                .to_str()
                .unwrap_or("unknown")
        }
    }

    /// Return the ID of this client handle. Every client has its own unique ID. This
    /// ID is never reused by the core, even if the mpv_handle at hand gets destroyed
    /// and new handles get allocated.
    ///
    /// IDs are never 0 or negative.
    ///
    /// Some mpv APIs (not necessarily all) accept a name in the form "@<id>" in
    /// addition of the proper mpv_client_name(), where "<id>" is the ID in decimal
    /// form (e.g. "@123"). For example, the "script-message-to" command takes the
    /// client name as first argument, but also accepts the client ID formatted in
    /// this manner.
    #[inline]
    pub fn id(&mut self) -> i64 {
        unsafe { mpv_client_id(self.as_mut_ptr()) }
    }

    /// Send a command to the player. Commands are the same as those used in
    /// input.conf, except that this function takes parameters in a pre-split
    /// form.
    pub fn commandv<I, S>(&mut self, args: I) -> Result<()>
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
        let args: Vec<CString> = args
            .into_iter()
            .map(|s| CString::new(s.as_ref()).unwrap())
            .collect();
        // println!("commandv: {:?}", args);
        let mut raw_args: Vec<*const c_char> = args.iter().map(|s| s.as_ptr()).collect();
        raw_args.push(std::ptr::null()); // Adding null at the end

        unsafe { result!(mpv_command(self.as_mut_ptr(), raw_args.as_ptr())) }
    }

    /// Send a command to the player. Commands are the same as those used in
    /// input.conf, except that this function takes parameters in a pre-split
    /// form.
    pub fn command_string<S>(&mut self, cmd: S) -> Result<()>
    where
        S: AsRef<str>,
    {
        let s = cmd.as_ref();
        let ptr = CString::new(s).unwrap().as_ptr();
        unsafe { result!(mpv_command_string(self.as_mut_ptr(), ptr)) }
    }

    pub fn command_json(&mut self, json: Vec<serde_json::Value>) -> Result<serde_json::Value> {
        // let (mut args_node, mut rt_node) = { json_to_mpv_node(args) };
        let mut args_list_node = vec![];
        // println!("json_to_mpv_node {:?}", json);

        // FIXME: memory leak
        let mut hack_vec = vec![];
        for p in json {
            match p {
                serde_json::Value::Null => {
                    println!("json_to_mpv_node not support Null")
                }
                serde_json::Value::Bool(b) => {
                    let node = mpv_node {
                        u: mpv_node__bindgen_ty_1 { int64: b as i64 },
                        format: mpv_format_MPV_FORMAT_FLAG,
                    };
                    args_list_node.push(node);
                }
                serde_json::Value::Number(n) => {
                    let node = mpv_node {
                        u: mpv_node__bindgen_ty_1 {
                            double_: n.as_f64().unwrap(), // string: s.as_ptr() as *mut i8,
                        },
                        format: mpv_format_MPV_FORMAT_DOUBLE,
                    };
                    args_list_node.push(node);
                }
                serde_json::Value::String(s) => {
                    let c = CString::new(s.clone()).unwrap();
                    // println!("{:?} {:?}", s, c);
                    let node = mpv_node {
                        u: mpv_node__bindgen_ty_1 {
                            string: c.as_ptr() as *mut i8,
                        },
                        format: mpv_format_MPV_FORMAT_STRING,
                    };
                    hack_vec.push(c);
                    args_list_node.push(node);
                }
                serde_json::Value::Array(vec) => {
                    println!("json_to_mpv_node not support Array")
                }
                serde_json::Value::Object(map) => {
                    println!("json_to_mpv_node not support Object")
                }
            }
        }

        let args_list_node_ptr = args_list_node.as_ptr() as *mut mpv_node;

        let args_list = mpv_node_list {
            num: args_list_node.len() as i32,
            values: args_list_node_ptr,
            keys: std::ptr::null_mut::<*mut i8>(),
        };

        let mut args_node = mpv_node {
            u: mpv_node__bindgen_ty_1 {
                // string: CString::new("").unwrap().as_ptr() as *mut i8, // string::a,
                list: &args_list as *const _ as *mut mpv_node_list,
            },
            format: mpv_format_MPV_FORMAT_NODE_ARRAY,
        };

        let mut rt_node = mpv_node {
            u: mpv_node__bindgen_ty_1 {
                int64: 0, // string::a,
            },
            format: mpv_format_MPV_FORMAT_INT64,
        };

        let arg_ptr = &mut args_node as *mut mpv_node;
        let rt_ptr = &mut rt_node as *mut mpv_node;
        unsafe {
            let e = mpv_command_node(self.as_mut_ptr(), arg_ptr, rt_ptr);

            match e {
                mpv_error::SUCCESS => {
                    let js = mpv_node_to_json(&mut rt_node);
                    // println!("mpv_node_to_json {:?}", js);
                    Ok(js)
                }
                err => {
                    println!("command_json error: {:?}", e);
                    Err(Error::new(err))
                }
            }
        }
    }

    /// Same as `Handle::command`, but run the command asynchronously.
    ///
    /// Commands are executed asynchronously. You will receive a
    /// `CommandReply` event. This event will also have an
    /// error code set if running the command failed. For commands that
    /// return data, the data is put into mpv_event_command.result.
    ///
    /// The only case when you do not receive an event is when the function call
    /// itself fails. This happens only if parsing the command itself (or otherwise
    /// validating it) fails, i.e. the return code of the API call is not 0 or
    /// positive.
    ///
    /// Safe to be called from mpv render API threads.
    pub fn command_async<I, S>(&mut self, reply: u64, args: I) -> Result<()>
    where
        I: IntoIterator<Item = S>,
        S: AsRef<str>,
    {
        let args: Vec<CString> = args
            .into_iter()
            .map(|s| CString::new(s.as_ref()).unwrap())
            .collect();
        let mut raw_args: Vec<*const c_char> = args.iter().map(|s| s.as_ptr()).collect();
        raw_args.push(std::ptr::null()); // Adding null at the end
        unsafe {
            result!(mpv_command_async(
                self.as_mut_ptr(),
                reply,
                raw_args.as_ptr()
            ))
        }
    }

    pub fn set_property<T: Format, S: AsRef<str>>(&mut self, name: S, data: T) -> Result<()> {
        let name = CString::new(name.as_ref())?;
        let handle = unsafe { self.as_mut_ptr() };
        data.to_mpv(|data| unsafe {
            result!(mpv_set_property(handle, name.as_ptr(), T::MPV_FORMAT, data))
        })
    }

    pub fn request_event(&mut self, mpv_event_id: u32, enable: bool) -> Result<()> {
        let handle = unsafe { self.as_mut_ptr() };
        // data.to_mpv(|data|
        unsafe {
            result!(mpv_request_event(
                handle,
                mpv_event_id as c_int,
                enable.into()
            ))
        }
        // })
    }
    /// Read the value of the given property.
    ///
    /// If the format doesn't match with the internal format of the property, access
    /// usually will fail with `MPV_ERROR_PROPERTY_FORMAT`. In some cases, the data
    /// is automatically converted and access succeeds. For example, i64 is always
    /// converted to f64, and access using String usually invokes a string formatter.
    pub fn get_property<T: Format, S: AsRef<str>>(&mut self, name: S) -> Result<T> {
        let name = CString::new(name.as_ref())?;
        let handle = unsafe { self.as_mut_ptr() };
        T::from_mpv(|data| unsafe {
            result!(mpv_get_property(handle, name.as_ptr(), T::MPV_FORMAT, data))
        })
    }

    pub fn observe_property<S: AsRef<str>>(
        &mut self,
        reply: u64,
        name: S,
        format: i32,
    ) -> Result<()> {
        let name = CString::new(name.as_ref())?;
        unsafe {
            result!(mpv_observe_property(
                self.as_mut_ptr(),
                reply,
                name.as_ptr(),
                format
            ))
        }
    }

    /// Undo `Handle::observe_property`. This will remove all observed properties for
    /// which the given number was passed as reply to `Handle::observe_property`.
    ///
    /// Safe to be called from mpv render API threads.
    pub fn unobserve_property(&mut self, registered_reply: u64) -> Result<()> {
        unsafe { result!(mpv_unobserve_property(self.as_mut_ptr(), registered_reply)) }
    }

    pub fn hook_add(&mut self, reply: u64, name: &str, priority: i32) -> Result<()> {
        let name = CString::new(name)?;
        unsafe {
            result!(mpv_hook_add(
                self.as_mut_ptr(),
                reply,
                name.as_ptr(),
                priority
            ))
        }
    }

    pub fn hook_continue(&mut self, id: u64) -> Result<()> {
        unsafe { result!(mpv_hook_continue(self.as_mut_ptr(), id)) }
    }
}

impl Client {
    pub fn new() -> Result<Self> {
        let handle = unsafe { mpv_create() };
        if handle.is_null() {
            Err(Error::new(mpv_error::NOMEM))
        } else {
            Ok(Self(handle))
        }
    }

    pub fn initialize(self) -> Result<Self> {
        unsafe { result!(mpv_initialize(self.0)).map(|()| self) }
    }
}

impl Drop for Client {
    fn drop(&mut self) {
        unsafe { mpv_destroy(self.0) }
    }
}

impl Deref for Client {
    type Target = Handle;

    #[inline]
    fn deref(&self) -> &Self::Target {
        Handle::from_ptr(self.0)
    }
}

impl DerefMut for Client {
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        Handle::from_ptr(self.0)
    }
}

unsafe impl Send for Client {}

impl Event {
    unsafe fn from_ptr(event: *const mpv_event) -> Event {
        match (*event).event_id {
            mpv_event_id::SHUTDOWN => Event::Shutdown,
            mpv_event_id::LOG_MESSAGE => Event::LogMessage(LogMessage::from_ptr((*event).data)),
            mpv_event_id::GET_PROPERTY_REPLY => Event::GetPropertyReply(
                result!((*event).error),
                (*event).reply_userdata,
                Property::from_ptr((*event).data),
            ),
            mpv_event_id::SET_PROPERTY_REPLY => {
                Event::SetPropertyReply(result!((*event).error), (*event).reply_userdata)
            }
            mpv_event_id::COMMAND_REPLY => {
                Event::CommandReply(result!((*event).error), (*event).reply_userdata)
            }
            mpv_event_id::START_FILE => Event::StartFile(StartFile::from_ptr((*event).data)),
            mpv_event_id::END_FILE => Event::EndFile(EndFile::from_ptr((*event).data)),
            mpv_event_id::FILE_LOADED => Event::FileLoaded,
            mpv_event_id::CLIENT_MESSAGE => {
                Event::ClientMessage(ClientMessage::from_ptr((*event).data))
            }
            mpv_event_id::VIDEO_RECONFIG => Event::VideoReconfig,
            mpv_event_id::AUDIO_RECONFIG => Event::AudioReconfig,
            mpv_event_id::SEEK => Event::Seek,
            mpv_event_id::PLAYBACK_RESTART => Event::PlaybackRestart,
            mpv_event_id::PROPERTY_CHANGE => {
                Event::PropertyChange((*event).reply_userdata, Property::from_ptr((*event).data))
            }
            mpv_event_id::QUEUE_OVERFLOW => Event::QueueOverflow,
            mpv_event_id::HOOK => {
                Event::Hook((*event).reply_userdata, Hook::from_ptr((*event).data))
            }
            _ => Event::None,
        }
    }
}

impl fmt::Display for Event {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let event = match *self {
            Self::Shutdown => mpv_event_id::SHUTDOWN,
            Self::LogMessage(..) => mpv_event_id::LOG_MESSAGE,
            Self::GetPropertyReply(..) => mpv_event_id::GET_PROPERTY_REPLY,
            Self::SetPropertyReply(..) => mpv_event_id::SET_PROPERTY_REPLY,
            Self::CommandReply(..) => mpv_event_id::COMMAND_REPLY,
            Self::StartFile(..) => mpv_event_id::START_FILE,
            Self::EndFile(..) => mpv_event_id::END_FILE,
            Self::FileLoaded => mpv_event_id::FILE_LOADED,
            Self::ClientMessage(..) => mpv_event_id::CLIENT_MESSAGE,
            Self::VideoReconfig => mpv_event_id::VIDEO_RECONFIG,
            Self::AudioReconfig => mpv_event_id::AUDIO_RECONFIG,
            Self::Seek => mpv_event_id::SEEK,
            Self::PlaybackRestart => mpv_event_id::PLAYBACK_RESTART,
            Self::PropertyChange(..) => mpv_event_id::PROPERTY_CHANGE,
            Self::QueueOverflow => mpv_event_id::QUEUE_OVERFLOW,
            Self::Hook(..) => mpv_event_id::HOOK,
            _ => mpv_event_id::NONE,
        };

        f.write_str(unsafe {
            CStr::from_ptr(mpv_event_name(event))
                .to_str()
                .unwrap_or("unknown event")
        })
    }
}

impl Property {
    /// Wrap a raw mpv_event_property
    /// The pointer must not be null
    fn from_ptr(ptr: *const c_void) -> Self {
        assert!(!ptr.is_null());
        Self(ptr as *const mpv_event_property)
    }

    /// Name of the property.
    pub fn name(&self) -> &str {
        unsafe { CStr::from_ptr((*self.0).name) }
            .to_str()
            .unwrap_or("unknown")
    }

    pub fn data<T: Format>(&self) -> Option<T> {
        unsafe {
            if (*self.0).format == T::MPV_FORMAT {
                T::from_ptr((*self.0).data).ok()
            } else {
                None
            }
        }
    }
}

impl fmt::Display for Property {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(self.name())
    }
}

impl LogMessage {
    /// Wrap a raw mpv_event_log_message
    /// The pointer must not be null
    fn from_ptr(ptr: *const c_void) -> Self {
        assert!(!ptr.is_null());
        Self(ptr as *const mpv_event_log_message)
    }
}

impl fmt::Display for LogMessage {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str("log message")
    }
}

impl StartFile {
    /// Wrap a raw mpv_event_start_file
    /// The pointer must not be null
    fn from_ptr(ptr: *const c_void) -> Self {
        assert!(!ptr.is_null());
        Self(ptr as *const mpv_event_start_file)
    }

    /// Playlist entry ID of the file being loaded now.
    pub fn playlist_entry_id(&self) -> u64 {
        unsafe { (*self.0).playlist_entry_id }
    }
}

impl fmt::Display for StartFile {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str("start file")
    }
}

impl EndFile {
    /// Wrap a raw mpv_event_end_file
    /// The pointer must not be null
    fn from_ptr(ptr: *const c_void) -> Self {
        assert!(!ptr.is_null());
        Self(ptr as *const mpv_event_end_file)
    }
}

impl fmt::Display for EndFile {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str("end file")
    }
}

impl ClientMessage {
    /// Wrap a raw mpv_event_client_message.
    /// The pointer must not be null
    fn from_ptr(ptr: *const c_void) -> Self {
        assert!(!ptr.is_null());
        Self(ptr as *const mpv_event_client_message)
    }

    pub fn args<'a>(&self) -> Vec<&'a str> {
        unsafe {
            let args = std::slice::from_raw_parts((*self.0).args, (*self.0).num_args as usize);
            args.iter()
                .map(|arg| CStr::from_ptr(*arg).to_str().unwrap())
                .collect()
        }
    }
}

impl fmt::Display for ClientMessage {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str("client-message")
    }
}

impl Hook {
    /// Wrap a raw mpv_event_hook.
    /// The pointer must not be null
    fn from_ptr(ptr: *const c_void) -> Self {
        assert!(!ptr.is_null());
        Self(ptr as *const mpv_event_hook)
    }

    /// The hook name as passed to `Handle::hook_add`.
    pub fn name(&self) -> &str {
        unsafe { CStr::from_ptr((*self.0).name).to_str().unwrap_or("unknown") }
    }

    /// Internal ID that must be passed to `Handle::hook_continue`.
    pub fn id(&self) -> u64 {
        unsafe { (*self.0).id }
    }
}

impl fmt::Display for Hook {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(self.name())
    }
}
