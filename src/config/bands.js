// Band configuration — the front-end theming surface.
//
// Each band maps to a skater character and a logo (used as hallway graffiti).
// Music is NOT configured here anymore: the front-end asks the backend for a
// band's playable preview via GET /api/song/:bandId. The Spotify track id per
// band lives backend-side in server/tracks.json (single source of truth, so the
// secret-holding server owns it and the browser never sees a track/URL).
//
// Asset notes:
//  - characterSprite / logoAsset: texture KEYS. Leave null to use the built-in
//    procedural pixel-art generator (derived from `themeColor` + `initials`).
//    To use your own art, drop a file in /public, load it in BootScene, and put
//    its texture key here.

export const BANDS = {
  'blink-182': {
    displayName: 'blink-182',
    initials: '182',
    themeColor: 0xff4fa3, // hot pink
    accentColor: 0x2bd1fc, // cyan
    characterSprite: null,
    logoAsset: null,
  },
  'green-day': {
    displayName: 'Green Day',
    initials: 'GD',
    themeColor: 0x4cd137, // green
    accentColor: 0xff0000, // red (heart-grenade vibe)
    characterSprite: null,
    logoAsset: null,
  },
  'linkin-park': {
    displayName: 'Linkin Park',
    initials: 'LP',
    themeColor: 0xff7a00, // burnt orange
    accentColor: 0x1a1a1a, // near-black
    characterSprite: null,
    logoAsset: null,
  },
  'sum-41': {
    displayName: 'Sum 41',
    initials: '41',
    themeColor: 0xf5d442, // yellow
    accentColor: 0x202020, // black
    characterSprite: null,
    logoAsset: null,
  },
  'avril-lavigne': {
    displayName: 'Avril Lavigne',
    initials: 'AL',
    themeColor: 0xd23bff, // purple/magenta
    accentColor: 0x000000, // black (necktie era)
    characterSprite: null,
    logoAsset: null,
  },
};

// Stable display order for the selection roster.
export const BAND_ORDER = [
  'blink-182',
  'green-day',
  'linkin-park',
  'sum-41',
  'avril-lavigne',
];
