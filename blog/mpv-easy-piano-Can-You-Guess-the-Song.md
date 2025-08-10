# mpv-easy-piano: Can You Guess the Song?

Welcome to an exciting dive into `mpv-easy-piano`, a unique project that brings a browser-based piano experience into the MPV media player! Imagine pausing your favorite video, popping up a piano interface, and challenging yourself to guess a melody. That's the essence of *mpv--piano: Can You Guess the Song?* This project, built using the [mpv-easy](https://github.com/mpv-easy/mpv-easy) toolkit, showcases how modern frontend toolchains like React and TypeScript can be leveraged to develop interactive MPV UI scripts while reusing existing web code. In this post, we'll explore `mpv-easy`, the development process, and the highlights of `mpv-easy-piano`.

## What is mpv-easy?

MPV is a powerful, open-source media player known for its lightweight design and extensive customization options. However, creating UI scripts for MPV traditionally involves Lua or JavaScript, which can feel clunky for frontend developers. Enter `mpv-easy`, a TypeScript and React-based toolkit designed to simplify MPV script development, particularly for UI-heavy extensions.

With `mpv-easy`, developers can use familiar frontend workflows to build MPV interfaces. Key features include:

- **Code Reuse**: Seamlessly adapt existing React components or web logic for MPV. The toolkit bridges React's rendering to MPV's On-Screen Display (OSD) elements like buttons and layouts.
- **Complex Layout Support**: It supports various UI styles (e.g., uosc, osc, oscx) with dark/light themes, handling mouse hovers, keyboard shortcuts, and responsive layouts.
- **Examples and Templates**: The repository includes demos like a drag-ball game, snake, and i18n support, plus a template (`mpv-easy-tpl`) for quick project setup.

In short, `mpv-easy` makes MPV scripting as intuitive as building a React app. You can use npm/yarn for dependencies, write components, and deploy scripts to MPV's config directory with commands like `dev-copy`.

## Building MPV UI Scripts with Frontend Toolchains

Traditionally, MPV scripts are written in Lua, but `mpv-easy` brings the power of modern frontend tools to the table. Here's how it works:

1. **Setup**: Clone the `mpv-easy` repository, install React/TypeScript dependencies, and configure MPV's environment (e.g., `MPV_CONFIG_DIR`).
2. **Write React Components**: Create UI elements using React, binding them to MPV events (e.g., playback controls, keyboard inputs) via `mpv-easy` APIs.
3. **Reuse Web Code**: Import existing web components into your MPV script. `mpv-easy` handles the rendering bridge, ensuring web logic works within MPV's OSD.
4. **Test and Deploy**: Use hot-reloading and performance monitoring during development. Deployed scripts integrate seamlessly, supporting custom shortcuts (e.g., volume, fullscreen).

This approach boosts productivity and enables modern, interactive UIs in MPV, all while maintaining compatibility with its lightweight nature.

## mpv-easy-piano: Bringing free-piano to MPV

Now, let's talk about the star of the show: `mpv-easy-piano`. Check out the code at [mpv-easy/mpv-easy-react/scripts/piano.tsx](https://github.com/mpv-easy/mpv-easy/blob/main/mpv-easy-react/scripts/piano.tsx). This script is a port of [free-piano](https://ahaoboy.github.io/free-piano/), a simple web-based piano app that lets users play melodies via mouse clicks or keyboard inputs, complete with multiple octaves, sustain pedal, and volume control. Built with JavaScript and HTML5 Audio, `free-piano` is perfect for quick musical fun.

Using `mpv-easy`, we brought this experience into MPV. The `piano.tsx` script defines a React component that renders a piano keyboard, handles input events, and plays audio. Key features include:

- **UI Layout**: A responsive piano key layout (white and black keys) with dynamic scaling and theme support, testing `mpv-easy`'s ability to handle complex, multi-layered layouts.
- **Interaction**: Maps MPV input events to piano keys (e.g., A/S/D keys for notes). Audio playback leverages MPV's audio APIs or embedded sound sources.
- **Guess-the-Song Game**: To spice things up, we added a game mode where the script plays a random melody snippet from a preset library, challenging users to guess the song by playing along. Hence the title: *Can You Guess the Song?* Think of it as guessing the intro to "Happy Birthday"!

This project doubles as a stress test for `mpv-easy`. `free-piano` involves intricate UI elements (e.g., simultaneous key presses, animations) and logic, proving that `mpv-easy` can handle complex projects without performance hiccups. Layout-wise, it ensures precise font alignment, spacing, and responsiveness across MPV window sizes.

## Why Try It?

`mpv-easy-piano` is more than a fun toy—it's a testament to `mpv-easy`'s potential to make MPV scripting accessible and powerful. Whether you're an MPV enthusiast or a frontend developer, this project is a great way to experiment. Install MPV, clone the repo, run the script, and start playing piano while watching videos. Challenge your friends to guess the song!

Ready to dive in? Star the [GitHub repo](https://github.com/mpv-easy/mpv-easy) or contribute ideas. Future enhancements could include MIDI support or multiplayer guess-the-song modes. Have fun and keep jamming!

*This post is based on the `mpv-easy` repository. Check the source files for code details.*