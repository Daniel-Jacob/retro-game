## Context

The game (`retro-skate-game`) is a static Phaser 3 build served by rootless nginx. Music is played by `src/audio/AudioManager.js` via an HTML5 `Audio` element streaming a per-band `songUrl` from `src/config/bands.js` — empty by default, so the game ships silent.

The requester has a Spotify app (client ID + secret) and wants real band songs. Locked decisions:
- **30-second previews** via the **Client Credentials** flow — no per-user login, no Premium requirement.
- A **Node service inside the game container** holds the secret and brokers preview URLs.
- Each band maps to a **hardcoded Spotify track ID**.

Hard Spotify facts that shape this design:
- Client Credentials grants app-only access (search, `GET /v1/tracks/{id}`) but **cannot** play full tracks — only `preview_url` (a ~30s MP3) is playable without user auth.
- The **client secret must never reach the browser**; it lives only in the Node process.
- `preview_url` is sometimes `null` (track/market dependent), so silent fallback is mandatory.

## Goals / Non-Goals

**Goals:**
- Play a real 30-second preview per band, sourced from Spotify, with zero player login.
- Keep the client secret server-side; inject it via env/secret at runtime.
- Preserve all existing audio behavior: autoplay-compliant start, looping, mute persisted across scenes, non-fatal on any failure.
- Single rootless container that serves both the static game and the preview API; OpenShift-compatible.
- Cache tokens and resolved preview URLs to stay well within Spotify rate limits.

**Non-Goals:**
- Full-song playback / Web Playback SDK / per-user OAuth / Premium (explicitly out).
- User-facing Spotify login or account linking.
- Track search UX or letting players choose songs (track IDs are fixed in config).
- Persisting anything to a database.

## Decisions

### Playback: Client Credentials + `preview_url`
The Node service authenticates with `POST https://accounts.spotify.com/api/token` (grant_type=client_credentials, Basic auth = base64(`id:secret`)), then calls `GET https://api.spotify.com/v1/tracks/{id}` and returns `preview_url`. The browser plays that MP3 through the **existing** `AudioManager` (no SDK). *Alternative:* Web Playback SDK — rejected (Premium + login friction for a drop-in office game).

### Runtime: single Node process serves static + API
The runtime container runs one Node HTTP server that:
1. serves the built static game from `dist/`, and
2. exposes `GET /api/song/:bandId`.

This collapses "static server + API sidecar" into one process — simplest single deployable, no nginx, no process supervisor. *Alternatives:* nginx + Node via supervisor (more moving parts, rejected for simplicity); separate Spring Boot broker (matches house stack but a second deployable — the requester chose the in-image Node option).

Framework: prefer **zero/minimal deps** — Node's built-in `http` + static-file serving, or a thin Express. Default to Express only if it materially simplifies; otherwise built-in `http` keeps the image small.

### API contract
`GET /api/song/:bandId` →
- `200 { bandId, trackId, name, artists, previewUrl }` when a preview exists,
- `200 { bandId, trackId, previewUrl: null, reason }` when no preview is available (still 200 — silence is a valid, expected outcome, keeps the client path simple),
- `404` for an unknown band id,
- `502 { error }` if Spotify is unreachable (client treats any non-playable result as "play silently").

The endpoint returns the **preview URL**, which the browser then streams directly from Spotify's CDN. (We proxy the URL, not the audio bytes — simpler, and the preview CDN is CORS/public.)

### Token & preview caching
- **Token**: cached in-memory with its `expires_in` (minus a 60s safety margin); refreshed lazily on demand. Single in-flight token request (no stampede).
- **Preview URLs**: cached in-memory keyed by track ID with a TTL (e.g. 6h). Because track IDs are fixed and few (5), this means ~5 Spotify calls per process lifetime in practice.

### Config & secrets
- `bands.js`: `songUrl` → `trackId` (Spotify track id string). Keep a band-id↔trackId map the backend can also read (shared JSON or the backend reads the same `bands.js`/a small `tracks.json`).
- Secrets via env: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`. Never committed; injected as a Kubernetes/OpenShift Secret at runtime. If unset, the service starts but every `/api/song` resolves to `previewUrl: null` (game stays silent) and logs a clear warning.

### Front-end flow
On band selection (the existing user gesture), the front-end calls `GET /api/song/:bandId`; on a non-null `previewUrl` it hands the URL to `AudioManager.playBand`-style logic (loop the 30s clip). Null/任意 failure → silent, exactly as today. The fetch is fire-and-forget relative to scene start so a slow Spotify call never blocks entering the hallway.

## Risks / Trade-offs

- **[`preview_url` is often null]** → Silent fallback is a first-class, tested path; README documents choosing track IDs that have previews in the target market. Optionally log which bands resolved null at startup.
- **[Secret leakage]** → Secret only in the Node process env; never in `dist/`, never returned by the API, `.dockerignore`/`.gitignore` exclude any `.env`. The API returns only preview URLs + metadata.
- **[Looping a 30s clip is repetitive]** → Acceptable for short play sessions; mute control already exists. Could cross-fade later.
- **[Spotify rate limits / outage]** → Token + preview caching keeps call volume tiny; any failure degrades to silence, never a crash.
- **[Rootless Node image]** → Use a non-root Node base (e.g. `node:lts-alpine` running as an unprivileged user) on port 8080, `runAsNonRoot`, no privilege escalation — same constraints the nginx image satisfied.
- **[Preview licensing]** → 30s previews via the official API are lower-risk than full tracks but still governed by Spotify Developer Terms; documented in README.

## Migration Plan

1. Add `server/` Node service + `trackId` to band config; switch front-end to fetch preview URLs.
2. Replace the nginx runtime stage with a rootless Node runtime stage (build stage unchanged: `vite build` → `dist/`).
3. Provide `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` as env/secret.
Rollback: redeploy the previous nginx-only image tag; the game returns to silent/raw-URL behavior. No data migration.

## Open Questions

- Which exact track ID per band (and market) — must verify each has a non-null `preview_url`. (Assumed: deployer fills these in; sensible defaults provided where previews exist.)
- Express vs built-in `http` — decide at implementation based on whether static-serving ergonomics justify the dependency. (Assumed: minimal/built-in unless Express clearly simplifies.)
- Should the backend read `bands.js` directly or a separate `tracks.json`? (Assumed: a small shared map to avoid bundling front-end ES modules into the server.)
