// Shared dimension/physics constants in a dependency-free module.
//
// These live here (not in main.js) on purpose: main.js imports every scene and
// then instantiates the Phaser.Game, while scenes read these values at module
// load time. Importing them from main.js would create a circular dependency and
// a temporal-dead-zone ReferenceError. Keep this module import-free.

// Fixed internal resolution — the retro "native" canvas. Scale.FIT scales this
// to the window while preserving aspect. Raised to 960x540 (16:9) so UI text and
// the detailed characters render crisply rather than heavily upscaled.
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const GRAVITY_Y = 1500;
