// Game server (spec: deployment, spotify-integration).
//
// A single rootless Node process that serves the static Vite build from dist/
// AND the song-preview API at GET /api/song/:bandId. Previews are sourced from
// the iTunes Lookup API (see itunes.js) — no auth/secret required. No external
// deps — uses Node's built-in http/fs and global fetch.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveTrackPreview } from './itunes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// band id -> trackId (single source of truth).
const TRACKS = (() => {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'tracks.json'), 'utf8'));
    return raw.tracks || {};
  } catch (err) {
    console.warn('[server] could not read tracks.json:', err.message);
    return {};
  }
})();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

// GET /api/song/:bandId — resolve the band's track to a preview URL.
async function handleSong(res, bandId) {
  const entry = TRACKS[bandId];
  if (!entry) {
    return sendJson(res, 404, { error: 'unknown band', bandId });
  }
  const trackId = entry.trackId || '';

  // No track configured -> resolved, but silent. (200)
  if (!trackId) {
    return sendJson(res, 200, {
      bandId,
      trackId: null,
      previewUrl: null,
      reason: 'no-track-configured',
    });
  }

  try {
    const { name, artists, previewUrl } = await resolveTrackPreview(trackId);
    return sendJson(res, 200, {
      bandId,
      trackId,
      name,
      artists,
      previewUrl: previewUrl || null,
      reason: previewUrl ? undefined : 'no-preview-available',
    });
  } catch (err) {
    // iTunes unreachable / API error — client treats as "play silently".
    console.warn(`[server] song resolve failed for ${bandId}:`, err.message);
    return sendJson(res, 502, { bandId, trackId, error: 'preview-unreachable' });
  }
}

// Static file serving from dist/ with SPA fallback to index.html.
function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let rel = urlPath === '/' ? '/index.html' : urlPath;

  // Resolve safely inside DIST (block path traversal).
  const filePath = path.normalize(path.join(DIST, rel));
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // SPA fallback.
      return sendFile(res, path.join(DIST, 'index.html'));
    }
    sendFile(res, filePath);
  });
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.writeHead(404);
    res.end('Not found');
  });
  const headers = { 'Content-Type': type };
  if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    headers['Cache-Control'] = 'public, max-age=2592000, immutable';
  }
  res.writeHead(200, headers);
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url === '/api/health') {
    return sendJson(res, 200, { ok: true, provider: 'itunes' });
  }

  const songMatch = url.split('?')[0].match(/^\/api\/song\/([^/]+)$/);
  if (songMatch) {
    if (req.method !== 'GET') {
      res.writeHead(405);
      return res.end('Method Not Allowed');
    }
    return handleSong(res, decodeURIComponent(songMatch[1]));
  }

  if (url.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'not found' });
  }

  return serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`[server] listening on http://${HOST}:${PORT} (preview provider: itunes)`);
});
