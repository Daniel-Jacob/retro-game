## 1. Project setup

- [x] 1.1 Initialize a Vite + vanilla-JS (ES modules) project and add Phaser 3 as a dependency
- [x] 1.2 Configure Phaser game (`main.js`): fixed internal resolution, `pixelArt: true`, `roundPixels: true`, `Scale.FIT`, Arcade physics with gravity
- [x] 1.3 Add `index.html` mount point and base styling (full-window canvas, dark retro background)
- [x] 1.4 Set up project scripts (`dev`, `build`, `preview`) and a `.gitignore`/`.dockerignore`

## 2. Band configuration

- [x] 2.1 Create `bands.js` config keyed by band id (blink-182, green-day, linkin-park, sum-41, avril-lavigne) with `displayName`, `characterSprite`, `logoAsset`, `songUrl` (default empty), `themeColor`
- [x] 2.2 Add original, swappable pixel-art placeholder assets per band (character sprite + logo) referenced by the config
- [x] 2.3 Add a small config accessor/helper to read a band by id and validate the roster is non-empty

## 3. Game shell & scene flow

- [x] 3.1 Implement `BootScene`: load global/UI assets and band config, show a loading indicator, then start `BandSelectScene`
- [x] 3.2 Show a readable error state if band config is missing/empty (spec: game-shell)
- [x] 3.3 Wire scene order boot → band select → hallway → skate → game over via `scene.start()`
- [x] 3.4 Use the Phaser `registry` for shared session state (selected band id, mute flag)
- [x] 3.5 Verify responsive scaling preserves pixel-art proportions on window resize

## 4. Band selection scene

- [x] 4.1 Render the five band characters as selectable options with label + character art
- [x] 4.2 Implement keyboard navigation (arrows + confirm) with focus highlight
- [x] 4.3 Implement pointer/tap selection
- [x] 4.4 On select, store band id in registry and start `HallwayScene`

## 5. Hallway intro scene

- [x] 5.1 Build a side-scrolling hallway with walls that render the selected band's logo as graffiti (theme color tinting)
- [x] 5.2 Redirect to band selection if no valid band is in the registry
- [x] 5.3 Implement advance-to-gameplay (skate to end or confirm) → start `SkateScene` with same theme
- [x] 5.4 Trigger band music start on hallway entry (first scene after the selection gesture)

## 6. Skate gameplay scene

- [x] 6.1 Build the side-scrolling level (ground, background, level-end goal) with camera follow
- [x] 6.2 Implement skater movement: horizontal accel, jump-when-grounded, gravity
- [x] 6.3 Implement ramps: angled bodies/zones that launch the skater airborne with sufficient speed
- [x] 6.4 Implement grind rails/ledges: grind zones, enter/exit grind state, lock-to-rail, score over duration
- [x] 6.5 Implement air trick input and trick scoring while airborne
- [x] 6.6 Implement combo multiplier (accrues while chaining, banks on clean landing, resets on bail)
- [x] 6.7 Render HUD: current score and active combo
- [x] 6.8 Implement end-of-run condition (reach level end / timer) → start `GameOverScene` with final score

## 7. Band music system

- [x] 7.1 Implement audio manager using Phaser sound with HTML5 streaming from the band `songUrl`, looping
- [x] 7.2 Start audio only after the user-gesture selection; never autoplay on load
- [x] 7.3 Handle unset URL (silent) and load/stream failure (non-fatal) gracefully
- [x] 7.4 Implement mute/volume toggle (`M` key + on-screen button) persisted in registry across scenes

## 8. Game over scene

- [x] 8.1 Display final score and the selected band theme
- [x] 8.2 Implement "play again" → return to `BandSelectScene`
- [x] 8.3 Stop or carry music appropriately on transition

## 9. Build & containerization

- [x] 9.1 Produce a static production build (`vite build` → `dist/`) with hashed assets
- [x] 9.2 Write a multi-stage `Dockerfile`: `node:lts-alpine` build stage → `nginxinc/nginx-unprivileged:alpine` runtime stage serving `dist/` on port 8080
- [x] 9.3 Add nginx config with correct MIME types (incl. audio) and SPA fallback to `index.html`
- [x] 9.4 Confirm the image runs rootless on an unprivileged port (no privilege escalation, no host networking)
- [x] 9.5 Verify the game is reachable and playable via the mapped port in a browser

## 10. Documentation

- [x] 10.1 Write README: build/run instructions (`docker build`, `docker run -p 8080:8080`)
- [x] 10.2 Document per-band `songUrl` configuration and CORS/mixed-content requirements
- [x] 10.3 Document the copyright/licensing caveat for streaming real band songs
