## 1. Band track configuration

- [x] 1.1 Remove the now-unused `songUrl` from `src/config/bands.js` (the front-end resolves songs via the backend by band id, so it no longer needs a URL/track field)
- [x] 1.2 Add `server/tracks.json` mapping band id → Spotify `trackId` as the single source of truth (backend-owned; no front-end ES-module import)
- [x] 1.3 Drop the obsolete `hasSong` URL check from `bandConfig.js`; song presence is now determined by the backend response

## 2. Backend service

- [x] 2.1 Create `server/` Node HTTP service (built-in `http` or minimal Express) listening on port 8080
- [x] 2.2 Serve the static game build from `dist/` with correct MIME types and SPA fallback to `index.html`
- [x] 2.3 Implement Spotify Client Credentials token fetch (`POST /api/token`, Basic auth) with in-memory caching + expiry safety margin + single in-flight refresh
- [x] 2.4 Implement `GET /api/song/:bandId`: resolve trackId → `GET /v1/tracks/{id}` → return `{ bandId, trackId, name, artists, previewUrl }`
- [x] 2.5 Handle no-preview (200, previewUrl null), unknown band (404), and Spotify failure (502) per the API contract
- [x] 2.6 Cache resolved preview URLs per trackId with a TTL
- [x] 2.7 Read `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` from env; if missing, start anyway and resolve all songs to null with a clear warning (never log the secret)

## 3. Front-end integration

- [x] 3.1 In the music flow (HallwayScene / AudioManager), on band selection fetch `GET /api/song/:bandId` instead of reading `songUrl`
- [x] 3.2 Play the returned `previewUrl` via the existing HTML5 Audio path (loop, mute, autoplay-compliant); null/error → stay silent
- [x] 3.3 Make the fetch non-blocking so a slow Spotify call never delays entering the hallway
- [x] 3.4 Keep mute/volume + non-fatal failure behavior intact

## 4. Build & containerization

- [x] 4.1 Add the backend to the project (package scripts: `start` runs the server; keep `build` = `vite build`)
- [x] 4.2 Rewrite the `Dockerfile` runtime stage: rootless Node base, copy `dist/` + `server/`, run as non-root on port 8080 (drop the nginx stage / config)
- [x] 4.3 Ensure `.dockerignore` / `.gitignore` exclude `.env` and never bake secrets into the image
- [x] 4.4 Confirm the image runs rootless and both the game and `/api/song/:bandId` are reachable

## 5. Verification

- [x] 5.1 With credentials set, verify `/api/song/<band>` returns a real preview URL and the clip plays + loops in-game
- [x] 5.2 With a no-preview track and with credentials unset, verify the game runs silently without errors
- [x] 5.3 Verify the client secret never appears in the browser/network responses or static assets

## 6. Documentation

- [x] 6.1 Update README: Spotify app setup, `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` env/secret, per-band trackId config
- [x] 6.2 Document the 30-second preview limitation, silent fallback, and Spotify Developer Terms / licensing note
