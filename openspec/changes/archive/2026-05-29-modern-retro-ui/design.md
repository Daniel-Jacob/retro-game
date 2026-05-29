## Context

The game is a Phaser 3 + Vite pixel-art skater. Today: internal resolution 640×360 with `pixelArt: true` + `roundPixels: true`; characters are ~36×46 procedural sprites built in `src/gen/textures.js` from a single theme color; every screen uses inline `Courier New` text with minimal layout. Result: characters are unidentifiable blobs and the UI looks unfinished.

Locked direction with the requester:
- **Detailed stylized characters** — recognizable per-band signature look, original art, no real likenesses, still procedural/swappable.
- **Cleaner arcade/CRT aesthetic** — crisper, higher-res, modern layout + retro display font, subtle scanline/glow, smooth transitions; unmistakably retro.

## Goals / Non-Goals

**Goals:**
- Each band's skater is recognizable at a glance (silhouette, hair, outfit, accessory, palette) without copying real faces.
- Crisp, legible UI typography and characters (not heavily upscaled/blurry).
- A single shared theme (palette + fonts + component helpers + CRT overlay + transitions) used by every scene.
- Polished band-selection cards with focus/hover/selected states and smooth fades between scenes.
- Keep the retro feel; keep gameplay, scoring, audio, and backend untouched.

**Non-Goals:**
- Real band-member likenesses, photos, or trademarked logos (legal + scope).
- Switching to a different engine or a full vector/illustrated art pipeline.
- Reworking gameplay mechanics, levels, scoring, or the song backend.
- Mobile-first redesign (keyboard/pointer remains primary).

## Decisions

### Raise internal resolution to 960×540
Move the fixed canvas from 640×360 → **960×540** (same 16:9). This gives ~2.25× the pixels for sharper text and room for detailed characters, while `Scale.FIT` still scales to the window. Level/world layout uses relative coordinates or is rescaled; gameplay tuning (velocities/gravity) is reviewed so feel is preserved. *Alternative:* keep 640×360 and overlay a high-res DOM/UI layer — rejected (splits rendering, complicates Phaser-native UI).

### Crisp text despite `pixelArt`
`pixelArt: true` makes scaled bitmap text blocky. Keep pixel-art **sprites** crisp, but render **text** sharply by setting a higher text resolution (`text.setResolution(window.devicePixelRatio || 2)`) and avoiding fractional scaling on text objects. Sprites keep nearest-neighbor; text gets full-resolution rendering. *Alternative:* disable `pixelArt` globally — rejected (would blur the intended pixel sprites).

### Typography: bundled web fonts
Two fonts, **bundled** via Vite (not a runtime CDN call, for offline/intranet reliability and no external dependency):
- a retro **display** font for headings/band names (arcade-flavored but legible — e.g. a chunky geometric/techno face),
- a clean **body** font for labels/HUD/help text.
Load via `FontFace`/`document.fonts.ready` (or a tiny loader) in BootScene and only start the menu once fonts are ready, so text never renders in a fallback then pops. *Alternative:* Google Fonts `<link>` — rejected (external runtime dependency; flashes/fails offline).

### Detailed, signature characters (procedural, higher-res)
Rebuild the character generator to draw larger native sprites (~targeted detail, e.g. ~72×96) with shading, facial features, and a **per-band signature** kit driven by config:
- silhouette/hair (spiky, buzzed, beanie, long-with-streak, capped),
- outfit (band tee, tie, hoodie, tank),
- accessory (skate deck graphic, chain, wristband, eyeliner accent),
- the band's palette (existing `themeColor`/`accentColor`) plus skin/hair tones.
Each band gets distinct, hand-tuned parameters (in `bands.js` or a `looks` map) so the five read as clearly different people/vibes. Art stays original and swappable (a band can still override with `characterSprite`). The same sprite is reused (scaled down) for the hallway/gameplay skater. *Alternative:* hand-drawn PNGs — rejected (binary assets, less swappable; we'd hand-author in code anyway).

### Shared theme module `src/ui/theme.js`
Single source for: `PALETTE` (bg, surface, ink, muted, accent ramps), `FONTS` (family names + helpers `heading()/body()` returning Phaser text styles), component factories (`panel()`, `button()`, `label()`), a `crtOverlay(scene)` (scanline + vignette + optional subtle flicker, drawn on a scroll-fixed layer), and `transition(scene, toKey, data)` (camera fade-out → start → fade-in). Every scene imports these instead of inlining styles. *Alternative:* per-scene styling — rejected (inconsistent, hard to retune).

### CRT/arcade accents, used sparingly
A reusable overlay: faint horizontal scanlines, a soft vignette, and theme-colored glow on focused elements. Kept subtle (low alpha) so it polishes without hurting readability or performance. Toggle-able constant so it can be dialed down.

### Smooth scene transitions
Replace bare `scene.start()` calls with the theme `transition()` (short camera fade). Keeps continuity and feels modern; music/registry flow unchanged.

## Risks / Trade-offs

- **[Resolution bump changes gameplay feel/layout]** → Audit `SkateScene` coordinates and physics constants; use relative positioning and re-test ramps/grinds/jumps so the run plays the same. Camera/world bounds updated to new height.
- **[Procedural detail has a ceiling]** → Characters will be stylized "readable archetypes," not portraits. Signature hair/outfit/color carries recognition; descriptors on cards reinforce it. Acceptable per the chosen approach.
- **[Font loading race / FOUT]** → Gate the first interactive scene on `document.fonts.ready`; fall back to a system stack if a font fails (non-fatal).
- **[CRT overlay readability/perf]** → Keep alpha low, draw once as a static overlay (not per-frame redraw); provide a constant to reduce/disable.
- **[Pixel text still blurry on some DPRs]** → Set text resolution from `devicePixelRatio`; verify on a HiDPI and a standard display.
- **[Scope creep into gameplay]** → Strictly visual/UI; no mechanic changes. Logic, scoring, audio, backend untouched.

## Migration Plan

Pure front-end visual change. Build and redeploy the existing rootless Node image; no config, data, or API changes. Rollback = redeploy the previous image. Verify in-browser (boot → select → hallway → skate → game over) that fonts load, characters are distinct, text is crisp, transitions work, and gameplay is unchanged.

## Open Questions

- Exact font choices (display + body) — pick legible, license-clear faces (e.g. SIL OFL fonts) and bundle them. (Assumed: choose during implementation; document the choice.)
- Final per-band "signature" details — iterate until the five are clearly distinguishable. (Assumed: tune in `bands.js`/looks map.)
- Keep 960×540 vs another target — revisit if text still isn't crisp enough. (Assumed: 960×540.)
