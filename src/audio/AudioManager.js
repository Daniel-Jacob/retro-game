// Band music system.
//
// Uses a single HTML5 Audio element to stream a band's 30-second Spotify preview
// (resolved via the backend — see songApi). It loops, honours a persisted mute
// flag, starts only after a user gesture, and treats a missing preview / load
// failure as non-fatal (the game just stays silent).

import { fetchPreviewUrl } from './songApi.js';

const MUTE_KEY = 'muted';

export class AudioManager {
  constructor(game) {
    this.game = game;
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = 'none';
    this.audio.crossOrigin = 'anonymous'; // allow CORS-enabled hosts
    this.currentBandId = null;

    // Non-fatal: a bad/blocked URL must never crash the game (spec: band-music).
    this.audio.addEventListener('error', () => {
      console.warn('[audio] failed to load/stream song for', this.currentBandId);
    });

    // Persist mute across scenes via the Phaser registry.
    if (this.game.registry.get(MUTE_KEY) === undefined) {
      this.game.registry.set(MUTE_KEY, false);
    }
    this.applyMute();
  }

  isMuted() {
    return !!this.game.registry.get(MUTE_KEY);
  }

  applyMute() {
    this.audio.muted = this.isMuted();
  }

  toggleMute() {
    const next = !this.isMuted();
    this.game.registry.set(MUTE_KEY, next);
    this.applyMute();
    return next;
  }

  // Start (or switch to) a band's song. Resolves the Spotify preview URL from
  // the backend, then streams + loops it. Safe when no preview exists: the game
  // simply stays silent. Should be invoked from a user-gesture handler (the band
  // selection click) to satisfy browser autoplay policies.
  //
  // Async + fire-and-forget: a slow Spotify call never blocks scene transitions.
  playBand(bandId) {
    if (this.currentBandId === bandId && !this.audio.paused) return;
    this.currentBandId = bandId;
    this.stop();

    fetchPreviewUrl(bandId)
      .then((url) => {
        // The player may have moved to another band while we were fetching.
        if (this.currentBandId !== bandId) return;
        if (!url) return; // no preview -> silent, no error

        this.audio.src = url;
        this.applyMute();
        const p = this.audio.play();
        if (p && typeof p.catch === 'function') {
          // Autoplay rejection or network error — non-fatal.
          p.catch((err) => console.warn('[audio] play blocked/failed:', err?.name || err));
        }
      })
      .catch(() => {
        /* resolution failed — stay silent, non-fatal */
      });
  }

  stop() {
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
    } catch {
      /* ignore */
    }
  }
}

// Lazily create one AudioManager per game instance and reuse it everywhere.
export function getAudio(scene) {
  const game = scene.game;
  if (!game.audioManager) {
    game.audioManager = new AudioManager(game);
  }
  return game.audioManager;
}
