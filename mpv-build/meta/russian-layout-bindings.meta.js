// ==UserScript==
// @name         russian-layout-bindings
// @url          https://github.com/zenwarr/mpv-config/blob/master/scripts/russian-layout-bindings.lua
// @downloadURL  https://raw.githubusercontent.com/zenwarr/mpv-config/master/scripts/russian-layout-bindings.lua
// @description  As mpv does not support shortcuts independent of the keyboard layout (https://github.com/mpv-player/mpv/issues/351), this script tries to workaround this issue for some limited cases with russian (йцукен) keyboard layout. Upon startup, it takes currently active bindings from `input-bindings` property and duplicates them for russian layout. You can adapt the script for your preferred layout, but it won't (of course) work for layouts sharing unicode characters with english.
// @author       zenwarr
// ==/UserScript==