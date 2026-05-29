// Front-end song resolver (spec: band-music).
//
// Asks the backend for a band's playable preview URL. The backend holds the
// Spotify secret and returns only a preview URL (or null). Results are cached
// per band so re-entering a band doesn't refetch. Any failure resolves to null
// (the game then plays silently — non-fatal).

const cache = new Map(); // bandId -> previewUrl|null

export async function fetchPreviewUrl(bandId) {
  if (cache.has(bandId)) return cache.get(bandId);
  let url = null;
  try {
    const res = await fetch(`/api/song/${encodeURIComponent(bandId)}`);
    if (res.ok) {
      const data = await res.json();
      url = data && data.previewUrl ? data.previewUrl : null;
    }
  } catch {
    url = null; // backend unreachable -> silent
  }
  cache.set(bandId, url);
  return url;
}
