// Small accessor/validation helper over the band roster (task 2.3).
import { BANDS, BAND_ORDER } from './bands.js';

export class BandConfigError extends Error {}

// Returns the ordered list of band ids that actually exist in BANDS.
export function getBandIds() {
  return BAND_ORDER.filter((id) => Object.prototype.hasOwnProperty.call(BANDS, id));
}

// Returns the band config for an id, or null if unknown.
export function getBand(id) {
  if (!id) return null;
  return BANDS[id] ?? null;
}

// Returns [{ id, ...config }] in display order.
export function getRoster() {
  return getBandIds().map((id) => ({ id, ...BANDS[id] }));
}

// Throws BandConfigError if the roster is empty/invalid. Called at boot so the
// shell can show a readable error instead of a blank screen (spec: game-shell).
export function validateRoster() {
  const ids = getBandIds();
  if (ids.length === 0) {
    throw new BandConfigError('No bands configured. Check src/config/bands.js.');
  }
  for (const id of ids) {
    const b = BANDS[id];
    if (!b.displayName || typeof b.themeColor !== 'number') {
      throw new BandConfigError(`Band "${id}" is missing displayName or themeColor.`);
    }
  }
  return ids;
}
