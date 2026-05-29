// Procedural pixel-art generation (task 2.2).
//
// Rather than ship binary PNGs (and to avoid redistributing trademarked band
// logos), we draw original, blocky pixel-art textures at runtime with Phaser
// Graphics and bake them into the texture cache via generateTexture(). Each
// texture is derived from a band's themeColor + accentColor, so swapping a
// band's palette in bands.js automatically re-themes its art. To use real art
// instead, load a file in BootScene and point the band's *Sprite/*Asset key here.

import { getRoster } from '../config/bandConfig.js';

const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

// Draw a filled "pixel" block scaled up so everything stays on a chunky grid.
function px(g, color, x, y, w, h, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillRect(x, y, w, h);
}

// --- Skater character ------------------------------------------------------
// ~36x44 sprite: board + wheels, legs, themed shirt, head, accent hair.
function buildSkater(scene, key, theme, accent) {
  const g = scene.add.graphics();
  const skin = 0xf2c9a0;
  const board = 0x6b4a2b;
  const wheel = 0xe8e8e8;
  const pants = 0x2a2a35;

  // board + wheels (bottom)
  px(g, wheel, 6, 40, 6, 4);
  px(g, wheel, 24, 40, 6, 4);
  px(g, board, 4, 36, 28, 4);
  // legs
  px(g, pants, 10, 26, 6, 12);
  px(g, pants, 20, 26, 6, 12);
  // torso / band shirt
  px(g, theme, 9, 12, 18, 16);
  // arms
  px(g, theme, 5, 14, 5, 10);
  px(g, theme, 26, 14, 5, 10);
  px(g, skin, 5, 22, 5, 4);
  px(g, skin, 26, 22, 5, 4);
  // head
  px(g, skin, 12, 2, 12, 12);
  // spiky accent hair
  px(g, accent, 11, 0, 14, 4);
  px(g, accent, 13, -2, 3, 3);
  px(g, accent, 18, -2, 3, 3);

  g.generateTexture(key, 36, 46);
  g.destroy();
}

// --- Logo badge ------------------------------------------------------------
// A graffiti-ish splatter badge (no text — the band initials are overlaid as a
// live Text object so the same badge works for any band).
function buildLogoBadge(scene, key, theme, accent) {
  const g = scene.add.graphics();
  const w = 120;
  const h = 80;
  // paint splatter blobs
  px(g, accent, 0, 0, w, h, 0.0);
  g.fillStyle(theme, 0.9);
  g.fillRoundedRect(6, 10, w - 12, h - 20, 10);
  // drips
  px(g, theme, 24, h - 12, 6, 14, 0.8);
  px(g, theme, 70, h - 12, 5, 18, 0.8);
  px(g, theme, 96, h - 12, 4, 10, 0.8);
  // outline
  g.lineStyle(4, accent, 1);
  g.strokeRoundedRect(6, 10, w - 12, h - 20, 10);
  // corner stars
  g.fillStyle(accent, 1);
  g.fillRect(12, 16, 4, 4);
  g.fillRect(w - 18, h - 24, 4, 4);

  g.generateTexture(key, w, h + 4);
  g.destroy();
}

// --- Shared level textures (theme-tinted at use site where needed) ---------
function buildShared(scene) {
  // 1x1 white pixel for tinting/particles
  {
    const g = scene.add.graphics();
    px(g, 0xffffff, 0, 0, 1, 1);
    g.generateTexture('px', 1, 1);
    g.destroy();
  }
  // ground tile (concrete with speckle)
  {
    const g = scene.add.graphics();
    px(g, 0x3a3a44, 0, 0, 32, 32);
    px(g, 0x4a4a56, 0, 0, 32, 4);
    px(g, 0x2c2c34, 6, 12, 3, 3);
    px(g, 0x2c2c34, 20, 22, 3, 3);
    g.generateTexture('ground', 32, 32);
    g.destroy();
  }
  // grind rail segment
  {
    const g = scene.add.graphics();
    px(g, 0xb8b8c4, 0, 0, 32, 6);
    px(g, 0x80808c, 0, 6, 32, 4);
    g.generateTexture('rail', 32, 10);
    g.destroy();
  }
  // ramp (right-facing quarter pipe wedge)
  {
    const g = scene.add.graphics();
    g.fillStyle(0x5a4636, 1);
    g.beginPath();
    g.moveTo(0, 64);
    g.lineTo(64, 64);
    g.lineTo(64, 0);
    g.closePath();
    g.fillPath();
    g.lineStyle(3, 0x3a2c20, 1);
    g.strokePath();
    g.generateTexture('ramp', 64, 64);
    g.destroy();
  }
  // level-end goal flag
  {
    const g = scene.add.graphics();
    px(g, 0xffffff, 0, 0, 4, 80);
    px(g, 0xffd000, 4, 4, 28, 20);
    px(g, 0x000000, 4, 4, 7, 10);
    px(g, 0x000000, 18, 14, 7, 10);
    g.generateTexture('goal', 32, 80);
    g.destroy();
  }
}

// Generate every band's character + logo, plus shared textures, into `scene`.
export function generateAllTextures(scene) {
  buildShared(scene);
  for (const band of getRoster()) {
    if (!band.characterSprite && !scene.textures.exists(skaterKey(band.id))) {
      buildSkater(scene, skaterKey(band.id), band.themeColor, band.accentColor);
    }
    if (!band.logoAsset && !scene.textures.exists(logoKey(band.id))) {
      buildLogoBadge(scene, logoKey(band.id), band.themeColor, band.accentColor);
    }
  }
}

// Texture-key helpers. If a band supplies its own art key, prefer it.
export function skaterKey(id) {
  const band = getRoster().find((b) => b.id === id);
  return band?.characterSprite || `skater-${id}`;
}
export function logoKey(id) {
  const band = getRoster().find((b) => b.id === id);
  return band?.logoAsset || `logo-${id}`;
}

export { hex };
