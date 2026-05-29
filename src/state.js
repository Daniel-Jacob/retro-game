// Shared session-state keys stored in the Phaser registry (task 3.4).
// The registry persists across scene transitions for the lifetime of the page,
// so every scene reads selection/score/mute without re-passing data.
export const REG = {
  SELECTED_BAND: 'selectedBand',
  LAST_SCORE: 'lastScore',
  MUTED: 'muted',
  CRASHED: 'crashed', // true when the last run ended by hitting a hazard
};
