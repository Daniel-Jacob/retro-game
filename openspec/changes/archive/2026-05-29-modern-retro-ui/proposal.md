## Why

The current UI is functional but rough: characters are low-resolution generic pixel blobs derived only from a theme color, so you can't tell which band is which beyond the text label, and the screens use a single monospace font with minimal layout. The game should look polished and modern while keeping its retro arcade soul — and the band characters should be recognizable at a glance.

## What Changes

- Introduce a shared **modern-retro UI theme** (`ui-theme`) applied across all scenes: a cohesive palette, a crisp retro display font for headings + a legible body font, reusable panel/button/label helpers, subtle CRT touches (scanline/vignette/glow accents), and smooth scene transitions (fades).
- **Redesign the band characters** to be higher-fidelity and visually distinct: each band gets a *signature look* (hairstyle, outfit, accessory, palette) so players can immediately recognize who's who — original stylized art, **no real-person likenesses**, still generated/swappable.
- Render characters and UI text **crisp and less pixelated** (raise the internal resolution and render type at full resolution) while keeping the game-world sprites in their pixel-art style.
- **Polish the band-selection screen**: portrait-framed character cards, band name in the display font, a short descriptor, focus/hover animation (scale + theme-color glow), and a clear selected state.
- Apply the theme to the **boot, hallway, gameplay HUD, and game-over** screens for consistency (typography, panels, transitions).

## Capabilities

### New Capabilities
- `ui-theme`: A shared visual system — palette, fonts (loaded before first render), panel/button/label helpers, CRT/scanline/glow overlay, and scene-transition helper — used consistently across every scene to deliver the "modern but retro" look.

### Modified Capabilities
- `band-selection`: Characters must be **recognizable and visually distinct per band** (higher-fidelity, signature look) rather than generic pixel blobs, and presented on polished, themed cards with focus/selected styling.

## Impact

- **New code**: a `src/ui/theme.js` (palette, fonts, helpers, CRT overlay, transitions); bundled web fonts (e.g. via Vite assets) with a readiness check before the first interactive scene.
- **Modified code**: `src/gen/textures.js` (detailed, per-band signature character + crisper logo art at higher native resolution), `src/main.js` (internal resolution / text rendering settings), `src/scenes/*` (BandSelect card redesign; Boot, Hallway, Skate HUD, GameOver restyle + transitions).
- **No gameplay/logic changes**: mechanics, scoring, audio, and the song/preview backend are untouched.
- **Asset approach unchanged**: characters remain original, theme-driven, and swappable; no trademarked logos or real likenesses are introduced.
- **Slight bundle increase** from bundled fonts (a few tens of KB) — acceptable for an intranet game.
