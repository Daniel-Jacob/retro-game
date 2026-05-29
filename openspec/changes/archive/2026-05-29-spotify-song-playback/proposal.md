> **Post-implementation note:** Spotify removed `preview_url` from the Web API for
> standard apps (late 2024), so Client-Credentials preview playback returns
> `null` and cannot produce audio. The implementation therefore sources 30-second
> previews from the **iTunes Lookup API** (no auth, no secret) instead. The shape
> below is unchanged (backend resolves a per-band track id → preview URL); only
> the provider differs. The `spotify-integration` capability was renamed to
> `song-previews` and the specs reflect the iTunes/no-secret reality.

## Why

The game currently plays band music only if a deployer manually sets a raw audio URL per band (empty by default, so it ships silent). We want real band songs sourced from Spotify using the existing Spotify app (client ID + secret), without forcing every office player to log in or hold a Premium account.

## What Changes

- Add a small **Node service in the game's container** that holds the Spotify **client ID + secret**, obtains a **Client Credentials** token, and resolves each band's configured Spotify **track ID** to its **30-second preview URL** via the Spotify Web API.
- Expose a minimal backend endpoint (e.g. `GET /api/song/:bandId`) that returns the resolved preview URL (and basic track metadata); the secret never reaches the browser.
- **BREAKING (config):** replace each band's raw `songUrl` with a hardcoded Spotify **`trackId`**. The front-end fetches the playable preview URL from the backend instead of reading a URL directly from config.
- Graceful degradation: if a track has **no preview available** or the backend/Spotify call fails, the band plays **silently** (current non-fatal behavior preserved).
- Change the runtime container from static-nginx-only to the **Node service serving both** the static game build **and** the Spotify API, still **rootless** and OpenShift-compatible. Secret supplied via environment/secret, never baked into the image.
- Update documentation (README) for Spotify app setup, env vars, per-band track IDs, and the preview-clip limitation.

## Capabilities

### New Capabilities
- `song-previews`: Backend broker that resolves a band's configured track id to a playable 30-second preview URL from a public preview provider (iTunes Lookup API), with caching and non-fatal error handling. No API key, secret, or login required. *(Originally proposed as `spotify-integration` using Spotify Client Credentials — see the post-implementation note above.)*

### Modified Capabilities
- `band-music`: Song source changes from a per-band raw `songUrl` to a per-band Spotify `trackId` resolved to a preview URL via the backend. Streaming/looping, autoplay-compliant start, mute/volume, and non-fatal failure behavior are retained.
- `deployment`: Runtime is now a single rootless Node service that serves the static game build and the Spotify API endpoint; the Spotify client secret is injected via environment/secret at runtime; documentation/config surface updated accordingly.

## Impact

- **New code**: a Node (Express or built-in `http`) service under e.g. `server/` — token management, `/api/song/:bandId`, static file serving for `dist/`.
- **Front-end**: `AudioManager` / band config flow fetches the preview URL from `/api/song/:bandId` instead of reading `songUrl`; `bands.js` gains `trackId`.
- **Build/Docker**: runtime stage switches to a rootless Node base image (non-root user, unprivileged port 8080) that runs the server; nginx config retired or repurposed.
- **Config/secrets**: `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` provided as env/secret (never committed, never sent to browser).
- **External dependency**: Spotify Web API (token endpoint + `GET /v1/tracks/{id}`). Subject to Spotify rate limits and the reality that `preview_url` may be `null` for some tracks/markets.
- **Legal note**: 30-second previews returned by the Spotify API are intended for preview use; this is lower-risk than streaming full copyrighted tracks, but usage remains subject to Spotify's Developer Terms.
