There are two parts: frontend and backend in mpv-easy, you can choose a field you are familiar with

## frontend

The frontend is implemented using ts and react

### mpv-easy

Provide complete UI and interaction

### mpv-ui

Provides basic components such as Button and Dropdown

### mpv-tool

A collection of mpv functions

### mpv-play-with

Tampermonkey script on the browser side

### plugins

Some mpv plugins

## backend

Due to the limitation of js scripts, we use rust to implement cross-platform extension functions, such as clipboard, etc.

### mpv-easy-ext

Provides basic file and network, clipboard capabilities

### mpv-play-with

Handle `mpv-easy://` protocol
