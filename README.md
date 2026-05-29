# Pop-Punk Skate 🛹

A retro **2D pixel-art skateboarding game** for the browser, themed around
early-2000s pop-punk/rock bands. Pick a band, roll through a graffiti hallway
tagged with their logo, then skate a side-scrolling level full of ramps and
grind rails while their song plays.

Built with **Phaser 3** + **Vite**, served by a small **rootless Node** server
that also brokers **30-second Spotify song previews**, shipped as a single Docker
image so anyone on the office network can play.

Bands: **blink-182**, **Green Day**, **Linkin Park**, **Sum 41**, **Avril Lavigne**.

## Controls

| Key | Action |
| --- | --- |
| ← / → | Move / steer |
| ↑ or `Space` | Jump (and hop off rails) |
| `Z` / `X` | Air tricks (kickflip / grab) |
| `Enter` / click | Confirm / drop in / play again |
| `M` | Mute / unmute |

Pick a band → skate down the hallway (or press `Enter`) → ramp, grind, and chain
tricks for combos before the timer runs out or you reach the goal flag.

## Run locally (dev)

```bash
npm install
npm run dev        # Vite dev server (hot reload) at http://localhost:5173
```

## Build & run the server

```bash
npm run build      # outputs the static site to dist/
npm run start      # runs the Node server (game + song API) at http://localhost:8080
# or in one step:
npm run serve      # build, then start
```

## Run with Docker (recommended for the office)

```bash
docker build -t retro-skate-game .
docker run --rm -p 8080:8080 \
  -e SPOTIFY_CLIENT_ID=your_client_id \
  -e SPOTIFY_CLIENT_SECRET=your_client_secret \
  retro-skate-game
# open http://localhost:8080
```

The image is **multi-stage**: a Node stage builds the static assets, and a
**rootless Node runtime** runs the server. It runs as the **non-root `node` user
(uid 1000) on port 8080** with no privilege escalation — compatible with
OpenShift/Kubernetes security constraints (`runAsNonRoot`, `allowPrivilegeEscalation: false`).
The Spotify client secret is **injected at runtime** (env/secret) and never baked
into the image. Without credentials the game runs fine — just silent.

## Spotify song previews

Music comes from **Spotify 30-second previews**. A tiny Node service (`server/`)
holds your Spotify app's **client ID + secret**, fetches a Client-Credentials
token, and resolves each band's track to its preview URL. **The secret stays
server-side and never reaches the browser** — the front-end only ever calls
`GET /api/song/:bandId` and receives a preview URL (or `null`).

### 1. Create a Spotify app

In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard),
create an app and copy its **Client ID** and **Client Secret**. (No redirect URI
or user login is needed — this uses the app-only Client Credentials flow.)

### 2. Provide the credentials

Set them as environment variables / secrets — **never commit them**:

```bash
export SPOTIFY_CLIENT_ID=...
export SPOTIFY_CLIENT_SECRET=...
```

For Kubernetes/OpenShift, supply them via a `Secret` referenced by the deployment
(`secretRef`). A local `.env` is git/docker-ignored.

### 3. Map bands to tracks

Edit [`server/tracks.json`](server/tracks.json) and set each band's `trackId` to a
Spotify **track id** (the part after `spotify:track:` or in a
`open.spotify.com/track/<id>` URL):

```json
{
  "tracks": {
    "blink-182": { "trackId": "0p2GtkRrlrZ4yIWeYzObqi" }
  }
}
```

Leave a `trackId` empty to keep that band silent. After editing, rebuild the
image (`tracks.json` is read at runtime, but it's copied in at build time).

### Behavior & limits

- **30-second previews only.** Full-song playback would require the Spotify Web
  Playback SDK + each player logging into their own **Premium** account — out of
  scope here by design.
- **`preview_url` is often `null`** for a given track/market. Pick track ids whose
  preview exists in your region; otherwise that band plays silently.
- **Silent fallback everywhere.** Missing credentials, an unconfigured track, no
  preview, or a Spotify outage all degrade gracefully to silence — never a crash.
- **Autoplay-compliant.** Audio starts on the band-select click (a user gesture),
  never on page load. Mute with `M`; the setting persists across scenes.
- **Caching.** The token and resolved preview URLs are cached in-memory, so the
  five bands cost only a handful of Spotify calls per server lifetime.

## ⚠️ Copyright / licensing note

Playing band music — even 30-second previews on an internal network — is governed
by **Spotify's Developer Terms**; previews are intended for preview use. This is
lower-risk than streaming full copyrighted tracks (which this project does **not**
do), but remains your responsibility as the deployer. The band names, logos, and
characters here are **original pixel-art interpretations** for a fun internal
project, not official artwork.

## Project layout

```
server/
  index.js             Node server: serves dist/ + GET /api/song/:bandId
  spotify.js           Client-Credentials token + track→preview resolution (+caching)
  tracks.json          ← edit me: band id → Spotify track id (single source of truth)
src/
  main.js              Phaser game config + scene registration
  constants.js         Shared resolution/physics constants (no imports)
  state.js             Registry keys for shared session state
  config/
    bands.js           ← edit me: band themes (colors, initials, art)
    bandConfig.js      roster accessors + validation
  gen/textures.js      procedural pixel-art (skaters, logos, level tiles)
  audio/
    AudioManager.js    plays/loops the resolved preview + mute (persisted)
    songApi.js         fetches /api/song/:bandId (cached, silent on failure)
  scenes/
    BootScene.js        load/validate, generate textures, error screen
    BandSelectScene.js  pick one of five bands (keyboard + pointer)
    HallwayScene.js     graffiti hallway intro, music starts here
    SkateScene.js       core gameplay: movement, ramps, grinds, combos, HUD
    GameOverScene.js    final score + play again
Dockerfile             multi-stage build → rootless Node runtime
```
