// Preview resolver — Apple iTunes Search/Lookup API.
//
// Replaces the Spotify Web API resolver: as of late 2024 Spotify removed
// `preview_url` from Web API responses for standard apps, so Client-Credentials
// playback no longer works. The public iTunes Lookup API still returns a 30-second
// `previewUrl` per track, needs no auth/secret, and is CORS-friendly.
//
// Resolves an iTunes track id to its preview. Results are cached in-memory.

const LOOKUP = (id) => `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&entity=song`;
const PREVIEW_TTL_MS = 6 * 60 * 60 * 1000; // 6h

const cache = new Map(); // trackId -> { value, cachedAt }

/**
 * Resolve an iTunes track id to { name, artists, previewUrl }.
 * previewUrl may be null (no preview). Throws only on transport/API errors so
 * the caller can distinguish "no preview" from "iTunes unreachable".
 */
export async function resolveTrackPreview(trackId) {
  if (!trackId) return { name: null, artists: [], previewUrl: null };

  const cached = cache.get(trackId);
  if (cached && Date.now() - cached.cachedAt < PREVIEW_TTL_MS) {
    return cached.value;
  }

  const res = await fetch(LOOKUP(trackId));
  if (!res.ok) {
    throw new Error(`itunes lookup failed: ${res.status}`);
  }
  const j = await res.json();
  const t = Array.isArray(j.results) ? j.results[0] : null;
  const value = {
    name: t?.trackName ?? null,
    artists: t?.artistName ? [t.artistName] : [],
    previewUrl: t?.previewUrl ?? null,
  };
  cache.set(trackId, { value, cachedAt: Date.now() });
  return value;
}
