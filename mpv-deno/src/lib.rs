use api::init_mp_api;
use mpv_client_dyn::mpv_handle;

use crate::mp_deno::run_mp_scripts;
pub mod api;
mod bindgen;
mod client_dyn;
mod mp_deno;
mod ops;

#[no_mangle]
unsafe extern "C" fn mpv_open_cplugin(handle: *mut mpv_handle) -> std::os::raw::c_int {
    init_mp_api(handle);
    run_mp_scripts();
    return 0;
}
