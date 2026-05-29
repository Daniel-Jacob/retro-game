## Context

This is a greenfield browser game with no existing code. The goal is a lightweight, self-hostable retro skateboarding game playable in any modern browser and distributable as a single Docker image for the office network.

Decisions already locked with the requester:
- **Visual style**: 2D pixel-art side-scroller.
- **Music**: real band songs streamed from a configurable URL (one per band).
- **Tech & hosting**: Phaser 3 built to static files, served by a rootless nginx Docker image.

The five band themes: blink-182, Green Day, Linkin Park, Sum 41, Avril Lavigne. Each maps to a skater character, a logo (used as hallway graffiti), and a song URL.

This artifact is independent of the org's usual Java/Spring stack but still respects the org's OpenShift/rootless container constraints.

## Goals / Non-Goals

**Goals:**
- Pick-up-and-play in seconds: open URL → pick band → skate.
- Side-scrolling skate level with ramps (launch into air) and grindable rails/ledges, plus a simple trick-score system.
- Graffiti hallway intro that shows the chosen band's logo before the run.
- Band song streams and loops during play; mute/volume control.
- One `docker run` serves the whole game; image is rootless and OpenShift-compatible.
- All band config (logo asset, song URL, character) externalized so it can change without rebuilding the game logic.

**Non-Goals:**
- 3D / Tony-Hawk-style free roam (explicitly out — 2D only).
- Multiplayer, online leaderboards, or persistence beyond the current browser session.
- Bundling/redistributing copyrighted song files inside the image (we stream from URLs the deployer supplies).
- Mobile/touch controls as a first-class target (keyboard-first; touch is a nice-to-have, not required).
- Account systems, backend APIs, or a database.

## Decisions

### Engine: Phaser 3 + Arcade Physics
Phaser 3 with the built-in **Arcade physics** engine. Arcade is AABB-based, fast, and sufficient for a side-scroller with gravity, ramps, and grind detection. *Alternatives:* Matter.js physics (more realistic but heavier and overkill for AABB platforming); hand-rolled canvas loop (rejected — reinvents collision/sprite/audio that Phaser provides).

### Build tooling: Vite
Vite for dev server + production static build (`vite build` → `dist/`). Fast HMR during development; outputs hashed static assets that nginx can serve directly. *Alternative:* Webpack (slower, more config). Phaser ships ES modules and works cleanly with Vite.

### Language: vanilla JS (ES modules), not TypeScript
Keep the toolchain minimal for a small game. Scenes are plain ES module classes extending `Phaser.Scene`. *Alternative:* TypeScript — better safety but adds build complexity; not warranted at this size. (Can be revisited if the game grows.)

### Scene architecture
One Phaser `Scene` per major state, wired through `this.scene.start()`:
`BootScene` (load global/UI assets, read config) → `BandSelectScene` → `HallwayScene` (graffiti intro) → `SkateScene` (gameplay) → `GameOverScene` (score + replay). A small shared **registry** (`this.registry`) holds the selected band key so every scene can read logo/song/character without re-passing data.

### Band configuration as data
A single `bands.js` (or `bands.json`) config object keyed by band id:
```
{
  "blink-182":   { displayName, characterSprite, logoAsset, songUrl, themeColor },
  "green-day":   { ... },
  "linkin-park": { ... },
  "sum-41":      { ... },
  "avril-lavigne": { ... }
}
```
`songUrl` defaults to empty/null (game runs silent if unset). This is the single externalized config surface. *Alternative:* hardcode per-scene — rejected (duplication, hard to retheme).

### Audio: Phaser Sound + HTML5 streaming
Use Phaser's sound manager backed by HTML5 Audio for streamed URLs (avoids fully decoding remote files into memory; supports progressive streaming and looping). Audio starts only after the first user gesture (band selection click) to satisfy browser autoplay policies. Global mute toggle (`M` key / on-screen button) persisted in the registry.

### Grinding & ramp mechanics
- **Ramps**: angled static bodies (or zones) that, on contact while moving, set an upward velocity → airborne state. While airborne, trick input awards score; landing while still holding a trick = bail (lose combo).
- **Grinding**: rail/ledge objects expose a thin "grind zone" on their top edge. Landing on a grind zone with sufficient horizontal speed enters a grind state: the skater locks to the rail top, score accrues per second, and an audio/visual cue plays until the rail ends or the player jumps off.
- **Scoring**: combo multiplier increases per trick/grind chained without touching flat ground; banked on landing cleanly.

### Pixel-art rendering
Phaser config `pixelArt: true` + `roundPixels: true` for crisp scaling; fixed internal resolution scaled with `Phaser.Scale.FIT` to keep the retro look across window sizes.

### Deployment: multi-stage rootless nginx
Stage 1 (`node:lts-alpine`): `npm ci && npm run build` → `dist/`.
Stage 2 (`nginxinc/nginx-unprivileged:alpine`): copy `dist/` to the web root, listen on port 8080 (unprivileged). This image runs as non-root by default, aligning with OpenShift constraints (`runAsNonRoot`, no privilege escalation, no host networking). nginx config sets correct MIME types and SPA-style fallback to `index.html`.

## Risks / Trade-offs

- **[Copyright: streaming real band songs internally still requires licensing]** → Song URLs are unset by default and fully configurable; the game plays silently without them. The deployer explicitly chooses what to point at, and this risk is documented here and in the README. Recommend internal use only and/or licensed/royalty-free sources.
- **[Mixed-content / CORS on song URLs]** → Streamed audio must be served over the same scheme (HTTPS↔HTTPS) and allow cross-origin playback; document that song URLs need CORS-friendly hosts or same-origin hosting. Fallback: drop files into the static asset folder and reference them locally.
- **[Browser autoplay blocking]** → Defer audio start until the band-select click (a real user gesture); never attempt autoplay on page load.
- **[Pixel-art asset availability]** → Real band logos/characters are themselves IP. Use stylized, original pixel-art evocations (color palette + lettering style) rather than exact trademarked logos; keep assets swappable via config. Flagged as a content task, not a blocker.
- **[Scope creep on physics]** → Arcade physics is intentionally simple; ramps/grinds are approximated with zones and state flags rather than true slope physics. Acceptable for a retro arcade feel.
- **[Phaser bundle size]** → ~1MB gzipped. Acceptable for a static intranet game; Vite code-splitting and gzip in nginx mitigate.

## Migration Plan

Greenfield — no migration. Deployment: `docker build` the multi-stage image, `docker run -p 8080:8080`, browse to the host. Rollback = redeploy previous image tag. Config changes (song URLs/logos) are a rebuild today; could be promoted to a runtime-mounted `config.json` later if needed.

## Open Questions

- Should song URLs be baked at build time or loaded at runtime from a mounted `config.json`? (Default: build-time `bands.js`; runtime config is a possible later enhancement.)
- Final art direction for each band character/logo — original pixel-art interpretation vs. supplied assets. (Assumed: original, swappable.)
- Number/length of skate levels per run — single endless-ish level vs. discrete stages. (Assumed: one side-scrolling level with an end goal for v1.)
