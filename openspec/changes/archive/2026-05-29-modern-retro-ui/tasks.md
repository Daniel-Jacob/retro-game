## 1. Theme foundation

- [x] 1.1 Add bundled web fonts (a retro display font + a legible body font; license-clear, e.g. SIL OFL) under `src/assets/fonts/` and import them via CSS/Vite
- [x] 1.2 Create `src/ui/theme.js` exposing `PALETTE`, `FONTS` (with `heading()` / `body()` Phaser text-style helpers), and component factories `panel()`, `button()`, `label()`
- [x] 1.3 Add a font-readiness helper (await `document.fonts.ready` / `FontFace`) and a system-font fallback that is non-fatal on load failure
- [x] 1.4 Add `crtOverlay(scene)` (subtle scanlines + vignette + optional flicker) and `transition(scene, toKey, data)` (camera fade-out → start → fade-in) to the theme, with a constant to dial CRT intensity

## 2. Resolution & crisp text

- [x] 2.1 Raise the internal resolution to 960×540 in `src/main.js` (keep `Scale.FIT`); keep `pixelArt` for sprites
- [x] 2.2 Ensure UI text renders crisply (set text resolution from `devicePixelRatio`, avoid fractional text scaling)
- [x] 2.3 Audit `SkateScene` world/camera coordinates and physics constants for the new resolution so gameplay feel and ramp/grind/jump layout are preserved

## 3. Detailed band characters

- [x] 3.1 Define a per-band "signature look" map (hair, outfit, accessory, palette) in `bands.js` or a `looks` module
- [x] 3.2 Rebuild the character generator in `src/gen/textures.js` to draw higher-resolution, shaded sprites with facial features and the per-band signature kit
- [x] 3.3 Ensure the five characters are clearly distinct; reuse the same sprite (scaled) for the hallway/gameplay skater
- [x] 3.4 Refresh the logo/graffiti badge art to match the crisper style; keep `characterSprite`/`logoAsset` overrides working

## 4. Band-selection screen redesign

- [x] 4.1 Redesign cards: portrait-framed character, band name in display font, a short descriptor, themed panel styling
- [x] 4.2 Add focus/hover animation (scale + theme-colored glow) and a clear selected state
- [x] 4.3 Keep keyboard (arrows + confirm) and pointer/tap selection working with the new layout
- [x] 4.4 Use the theme fade `transition()` into the hallway on selection

## 5. Apply theme to remaining scenes

- [x] 5.1 Restyle `BootScene` (loading + error states) with theme typography/palette and gate start on fonts ready
- [x] 5.2 Restyle `HallwayScene` (header, prompt) and use the fade transition into gameplay
- [x] 5.3 Restyle the `SkateScene` HUD (score/combo/timer/mute) with theme panels/typography; apply CRT overlay
- [x] 5.4 Restyle `GameOverScene` (final score, play again) with theme styling and transition back to band select

## 6. Verification

- [x] 6.1 Build and run; verify fonts load, text is crisp, and the five characters are clearly recognizable/distinct
- [x] 6.2 Play through boot → select → hallway → skate → game over; confirm transitions are smooth and gameplay is unchanged
- [x] 6.3 Check readability with the CRT overlay on, and verify scaling/crispness on a standard and a HiDPI display
