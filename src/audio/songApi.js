// Front-end song resolver (spec: band-music, song-previews).
//
// Resolves a band's 30-second preview URL. Two paths, tried in order:
//   1. The backend API (/api/song/:bandId) — used when the Node server is
//      running (local / container deploys).
//   2. A direct iTunes Lookup via JSONP — used on static hosts (e.g. GitHub
//      Pages) where there is no backend. Track ids come from the shared
//      tracks.json, bundled into the client. iTunes preview URLs are public and
//      need no auth, and JSONP sidesteps CORS.
// Any failure resolves to null (the game just plays silently — non-fatal).
// Results are cached per band.

import trackData from '../../server/tracks.json';

const cache = new Map(); // bandId -> previewUrl|null
const TRACKS = trackData.tracks || {};

export async function fetchPreviewUrl(bandId) {
  if (cache.has(bandId)) return cache.get(bandId);
  let url = await fromBackend(bandId);
  if (!url) url = await fromItunes(bandId);
  cache.set(bandId, url);
  return url;
}

// Path 1: backend API (present on server/container deploys).
async function fromBackend(bandId) {
  try {
    const res = await fetch(`/api/song/${encodeURIComponent(bandId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.previewUrl ? data.previewUrl : null;
  } catch {
    return null; // no backend here
  }
}

// Path 2: direct iTunes Lookup via JSONP (works on static hosting).
async function fromItunes(bandId) {
  const entry = TRACKS[bandId];
  const trackId = entry && entry.trackId;
  if (!trackId) return null;
  try {
    const data = await jsonp(`https://itunes.apple.com/lookup?id=${encodeURIComponent(trackId)}&entity=song`);
    const t = data && Array.isArray(data.results) ? data.results[0] : null;
    return (t && t.previewUrl) || null;
  } catch {
    return null;
  }
}

// Minimal JSONP helper (no CORS needed; iTunes supports a `callback` param).
function jsonp(url, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const cb = `itunes_cb_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
    const script = document.createElement('script');
    let timer;
    const cleanup = () => {
      delete window[cb];
      script.remove();
      clearTimeout(timer);
    };
    timer = setTimeout(() => {
      cleanup();
      reject(new Error('jsonp timeout'));
    }, timeoutMs);
    window[cb] = (data) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error('jsonp error'));
    };
    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${cb}`;
    document.head.appendChild(script);
  });
}
