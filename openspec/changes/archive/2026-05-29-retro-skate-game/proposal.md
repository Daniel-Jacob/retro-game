## Why

We want a fun, self-hostable browser game that people in the office can pick up and play in a few seconds. A retro 2D skateboarding game themed around early-2000s pop-punk/rock bands (blink-182, Green Day, Linkin Park, Sum 41, Avril Lavigne) gives us a memorable, shareable artifact that runs anywhere with a browser and ships as a single Docker image.

## What Changes

- Introduce a brand-new browser game built with **Phaser 3** (2D pixel-art side-scroller), with no existing code to modify.
- Add a **band/character selection** screen where the player picks one of five band-themed skater characters.
- Add a **primary hallway** starting area whose walls render graffiti of the selected band's logo.
- Add **skateboarding gameplay**: a side-scrolling skate level with ramps (launch/air) and grindable rails/ledges, plus a basic trick/score system.
- Add **band-themed music playback**: when a band is selected, the game streams that band's song from a configurable URL and loops it during play.
- Add a **static production build** of the game and a **rootless nginx Docker image** that serves it, so it can be deployed on the office network.

## Capabilities

### New Capabilities
- `game-shell`: Bootstraps the Phaser app, scene flow (boot → band select → hallway → skate level → game over), asset loading, and global config (band/song URLs).
- `band-selection`: The character-select experience — choosing one of the five band characters and locking in the band theme (logo + song) for the session.
- `hallway-intro`: The graffiti hallway starting scene that displays the selected band's logo on the walls and transitions the player into the skate level.
- `skate-gameplay`: Core side-scrolling skateboarding mechanics — movement, ramps/air, grinding on rails, trick scoring, and end-of-run handling.
- `band-music`: Selecting and streaming the correct band song from a configurable URL, with looping playback and volume/mute controls.
- `deployment`: Static production build pipeline and the rootless nginx Docker image that serves the game over HTTP.

### Modified Capabilities
<!-- None — this is a greenfield project with no existing specs. -->

## Impact

- **New repository content**: a JavaScript/Phaser 3 front-end project (game source, sprite/audio asset pipeline, build tooling such as Vite).
- **New infrastructure**: `Dockerfile` (multi-stage build → rootless nginx), nginx config, and `.dockerignore`.
- **Config surface**: a band-to-song-URL mapping and asset paths, externalized so song URLs and logos can be changed without code edits.
- **Legal/licensing note**: streaming real copyrighted band songs — even on an internal network — carries licensing risk. Song URLs are left configurable and unset by default so the deployer chooses what to point at; this risk is documented in `design.md`.
- **No impact** on the existing Java/Spring stack; this is an independent static web artifact.
