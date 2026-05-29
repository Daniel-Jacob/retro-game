// Procedural character + UI art (spec: band-selection, ui-theme).
//
// We draw original, theme-driven art at runtime with Phaser Graphics and bake it
// into the texture cache via generateTexture() — no binary PNGs, no trademarked
// logos, no real likenesses. Characters are now higher-resolution and use each
// band's "signature look" (see looks.js) so the five read as clearly different
// people. A band can still override art via characterSprite / logoAsset.

import { getRoster } from '../config/bandConfig.js';
import { LOOKS } from './looks.js';

const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
const darken = (c, f = 0.7) => {
  const r = ((c >> 16) & 0xff) * f;
  const g = ((c >> 8) & 0xff) * f;
  const b = (c & 0xff) * f;
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
};
const lighten = (c, f = 1.25) => {
  const r = Math.min(255, ((c >> 16) & 0xff) * f);
  const g = Math.min(255, ((c >> 8) & 0xff) * f);
  const b = Math.min(255, (c & 0xff) * f);
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
};

function px(g, color, x, y, w, h, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillRect(x, y, w, h);
}

// --- Detailed signature skater --------------------------------------------
// Native ~84x120. Drawn from a band look {skin, hair, shirt, pants, accessory, deck}.
const CW = 84;
const CH = 120;

function buildSkater(scene, key, look, theme) {
  const g = scene.add.graphics();
  const cx = CW / 2;
  const skin = look.skin;
  const skinShade = darken(skin, 0.86);
  const shirt = look.shirt.color;
  const shirtShade = darken(shirt, 0.78);
  const pants = look.pants;

  // shadow
  px(g, 0x000000, cx - 26, 116, 52, 4, 0.25);

  // skateboard
  px(g, 0x202024, 14, 110, 56, 5); // dark underside
  px(g, look.deck, 14, 106, 56, 5); // deck top (accent)
  px(g, lighten(look.deck, 1.3), 14, 106, 56, 1);
  px(g, 0xedeef2, 22, 114, 9, 5); // wheels
  px(g, 0xedeef2, 53, 114, 9, 5);

  // shoes
  px(g, 0xf2f2f5, 26, 100, 14, 7);
  px(g, 0xf2f2f5, 44, 100, 14, 7);
  px(g, 0xcacace, 26, 105, 14, 2);
  px(g, 0xcacace, 44, 105, 14, 2);

  // legs (pants)
  px(g, pants, 30, 74, 11, 28);
  px(g, pants, 43, 74, 11, 28);
  px(g, darken(pants, 0.8), 39, 74, 3, 28); // inseam shade

  // arms (behind torso) — skin forearms + sleeves
  px(g, shirt, 18, 48, 9, 18); // left sleeve
  px(g, shirt, 57, 48, 9, 18); // right sleeve
  px(g, skin, 18, 64, 9, 10); // left forearm
  px(g, skin, 57, 64, 9, 10); // right forearm
  px(g, skinShade, 18, 64, 2, 10);

  // torso (shirt)
  px(g, shirt, 24, 46, 36, 30);
  px(g, shirtShade, 53, 46, 7, 30); // right-side shade
  px(g, lighten(shirt, 1.15), 24, 46, 36, 2); // top highlight

  drawShirtDetail(g, look, cx);

  // accessory near collar/wrist
  drawAccessory(g, look, cx);

  // neck + head
  px(g, skinShade, cx - 5, 40, 10, 6); // neck
  px(g, skin, cx - 11, 18, 22, 24); // head
  px(g, skinShade, cx + 6, 18, 5, 24); // face shade
  // ears
  px(g, skin, cx - 13, 26, 3, 6);
  px(g, skin, cx + 10, 26, 3, 6);

  // face: eyes
  px(g, 0x20202a, cx - 6, 29, 3, 3);
  px(g, 0x20202a, cx + 3, 29, 3, 3);
  if (look.accessory === 'eyeliner') {
    px(g, 0x101014, cx - 7, 33, 5, 1);
    px(g, 0x101014, cx + 2, 33, 5, 1);
  }
  // mouth
  px(g, darken(skin, 0.6), cx - 3, 36, 6, 1);

  drawHair(g, look, cx);

  g.generateTexture(key, CW, CH);
  g.destroy();
}

function drawShirtDetail(g, look, cx) {
  const { style, color, tie } = look.shirt;
  if (style === 'tie') {
    // open collar + tie
    px(g, darken(color, 0.6), cx - 6, 46, 12, 4);
    const tc = tie || 0xff2d2d;
    px(g, tc, cx - 2, 48, 4, 18);
    px(g, lighten(tc, 1.2), cx - 2, 48, 4, 2);
  } else if (style === 'hoodie') {
    // hood + pocket + drawstrings
    px(g, darken(color, 0.85), cx - 16, 44, 32, 5); // hood roll
    px(g, darken(color, 0.7), cx - 9, 60, 18, 10); // kangaroo pocket
    px(g, 0xf2f2f5, cx - 3, 49, 1, 9); // string
    px(g, 0xf2f2f5, cx + 2, 49, 1, 9);
  } else if (style === 'tank') {
    // expose shoulders (skin), keep straps; optional tie
    px(g, look.skin, 24, 46, 8, 8);
    px(g, look.skin, 52, 46, 8, 8);
    if (tie) {
      px(g, tie, cx - 2, 48, 4, 16);
      px(g, lighten(tie, 1.2), cx - 2, 48, 4, 2);
    }
  } else {
    // plain tee — a simple band graphic block
    px(g, lighten(color, 1.3), cx - 7, 54, 14, 8, 0.85);
    px(g, darken(color, 0.5), cx - 5, 56, 10, 4);
  }
}

function drawAccessory(g, look, cx) {
  switch (look.accessory) {
    case 'wristband':
      px(g, look.deck, 18, 72, 9, 3);
      px(g, look.deck, 57, 72, 9, 3);
      break;
    case 'chain':
      px(g, 0xd9d9e2, cx - 8, 45, 16, 2, 0.9);
      px(g, 0xf2f2f5, cx - 1, 47, 2, 4);
      break;
    default:
      break;
  }
}

function drawHair(g, look, cx) {
  const { style, color, streak } = look.hair;
  const hl = lighten(color, 1.35);
  switch (style) {
    case 'spike':
      px(g, color, cx - 12, 14, 24, 8); // base
      for (let i = -10; i <= 8; i += 6) {
        px(g, color, cx + i, 6, 4, 10); // spikes
        px(g, hl, cx + i, 6, 1, 6);
      }
      break;
    case 'beanie':
      px(g, color, cx - 12, 10, 24, 12); // dome
      px(g, lighten(color, 1.6), cx - 12, 18, 24, 3); // fold highlight
      px(g, color, cx - 12, 12, 24, 2);
      break;
    case 'cap':
      px(g, color, cx - 12, 12, 24, 9); // cap dome
      px(g, lighten(color, 1.2), cx - 12, 12, 24, 2);
      px(g, color, cx + 10, 16, 8, 5); // backwards brim (right)
      px(g, darken(color, 0.7), cx - 2, 13, 4, 3); // button/strap
      break;
    case 'long':
      // hair framing face + down past shoulders
      px(g, color, cx - 14, 12, 28, 12); // crown
      px(g, color, cx - 14, 22, 6, 38); // left length
      px(g, color, cx + 8, 22, 6, 38); // right length
      if (streak) px(g, streak, cx - 14, 22, 3, 36); // colored streak
      px(g, hl, cx - 12, 13, 8, 2);
      break;
    case 'short':
    default:
      px(g, color, cx - 12, 12, 24, 10); // cap of hair
      px(g, color, cx - 12, 20, 4, 6); // sideburns
      px(g, color, cx + 8, 20, 4, 6);
      px(g, hl, cx - 9, 13, 12, 2); // highlight
      break;
  }
}

// --- Logo / graffiti badge -------------------------------------------------
function buildLogoBadge(scene, key, theme, accent) {
  const g = scene.add.graphics();
  const w = 150;
  const h = 96;
  g.fillStyle(darken(theme, 0.55), 1);
  g.fillRoundedRect(10, 14, w - 20, h - 28, 14); // backplate
  g.fillStyle(theme, 0.95);
  g.fillRoundedRect(6, 10, w - 20, h - 28, 14); // offset face (sticker look)
  g.fillStyle(lighten(theme, 1.25), 0.5);
  g.fillRoundedRect(6, 10, w - 20, 8, 14); // top sheen
  // drips
  px(g, theme, 30, h - 18, 7, 16, 0.85);
  px(g, theme, 86, h - 18, 6, 22, 0.85);
  px(g, theme, 116, h - 18, 5, 12, 0.85);
  // outline + studs
  g.lineStyle(4, accent, 1);
  g.strokeRoundedRect(6, 10, w - 20, h - 28, 14);
  g.fillStyle(accent, 1);
  g.fillRect(16, 18, 4, 4);
  g.fillRect(w - 30, h - 30, 4, 4);
  g.generateTexture(key, w, h);
  g.destroy();
}

// --- Shared level textures -------------------------------------------------
function buildShared(scene) {
  {
    const g = scene.add.graphics();
    px(g, 0xffffff, 0, 0, 1, 1);
    g.generateTexture('px', 1, 1);
    g.destroy();
  }
  {
    const g = scene.add.graphics();
    px(g, 0x3a3a44, 0, 0, 32, 32);
    px(g, 0x4a4a56, 0, 0, 32, 4);
    px(g, 0x2c2c34, 6, 12, 3, 3);
    px(g, 0x2c2c34, 20, 22, 3, 3);
    g.generateTexture('ground', 32, 32);
    g.destroy();
  }
  {
    const g = scene.add.graphics();
    px(g, 0xc6c6d2, 0, 0, 32, 6);
    px(g, 0x80808c, 0, 6, 32, 4);
    g.generateTexture('rail', 32, 10);
    g.destroy();
  }
  {
    const g = scene.add.graphics();
    g.fillStyle(0x5a4636, 1);
    g.beginPath();
    g.moveTo(0, 80);
    g.lineTo(80, 80);
    g.lineTo(80, 0);
    g.closePath();
    g.fillPath();
    g.lineStyle(3, 0x3a2c20, 1);
    g.strokePath();
    g.generateTexture('ramp', 80, 80);
    g.destroy();
  }
  {
    const g = scene.add.graphics();
    px(g, 0xffffff, 0, 0, 4, 96);
    px(g, 0xffd000, 4, 4, 30, 22);
    px(g, 0x101014, 4, 4, 8, 11);
    px(g, 0x101014, 19, 15, 8, 11);
    g.generateTexture('goal', 34, 96);
    g.destroy();
  }
}

// --- Retro prop obstacles --------------------------------------------------
// Original pixel art (no trademarks). Short enough to clear with a normal jump.
export const PROP_TYPES = [
  { type: 'record', key: 'prop-record', w: 50, h: 34 },
  { type: 'tape', key: 'prop-tape', w: 56, h: 36 },
  { type: 'soda', key: 'prop-soda', w: 44, h: 46, label: 'SODA' },
];

function buildProps(scene) {
  // record player
  {
    const g = scene.add.graphics();
    px(g, 0x5a4636, 0, 16, 50, 18); // wood base
    px(g, lighten(0x5a4636, 1.2), 0, 16, 50, 2);
    px(g, 0x33333c, 2, 12, 46, 6); // deck plate
    px(g, 0x141418, 8, 4, 28, 12); // platter
    px(g, 0x26262c, 8, 8, 28, 1); // groove
    px(g, 0xe23b3b, 18, 7, 7, 6); // label
    px(g, 0xdddddd, 21, 9, 2, 2); // spindle
    px(g, 0xb8b8c0, 30, 4, 13, 2); // tonearm
    px(g, 0xb8b8c0, 41, 4, 2, 8);
    px(g, 0x222226, 5, 20, 5, 4); // knobs
    px(g, 0x222226, 12, 20, 5, 4);
    g.generateTexture('prop-record', 50, 34);
    g.destroy();
  }
  // tape recorder
  {
    const g = scene.add.graphics();
    px(g, 0x3a3a44, 0, 8, 56, 28); // body
    px(g, 0x4a4a56, 0, 8, 56, 3); // top highlight
    px(g, 0x20202a, 7, 12, 42, 16); // window
    px(g, 0xeaeaea, 11, 14, 12, 12); // reel L
    px(g, 0xeaeaea, 33, 14, 12, 12); // reel R
    px(g, 0x888892, 16, 19, 3, 3); // hub L
    px(g, 0x888892, 38, 19, 3, 3); // hub R
    px(g, 0xcacace, 6, 30, 7, 3); // buttons
    px(g, 0xcacace, 15, 30, 7, 3);
    px(g, 0xcacace, 24, 30, 7, 3);
    px(g, 0xe23b3b, 47, 30, 6, 3); // record button
    g.generateTexture('prop-tape', 56, 36);
    g.destroy();
  }
  // generic retro soda stand (no trademark; the word "SODA" is overlaid in-scene)
  {
    const g = scene.add.graphics();
    px(g, 0xd23b32, 0, 0, 44, 46); // red cabinet
    px(g, 0xa82820, 0, 0, 4, 46); // edges/trim
    px(g, 0xa82820, 40, 0, 4, 46);
    px(g, 0xa82820, 0, 42, 44, 4);
    px(g, lighten(0xd23b32, 1.15), 4, 0, 36, 2);
    px(g, 0xf4f4f4, 8, 6, 28, 16); // white display panel
    px(g, 0xd23b32, 8, 14, 28, 3); // red swoosh stripe
    px(g, 0x222226, 10, 26, 5, 4); // selection buttons
    px(g, 0x222226, 18, 26, 5, 4);
    px(g, 0x222226, 26, 26, 5, 4);
    px(g, 0x111114, 33, 25, 3, 8); // coin slot
    px(g, 0x101014, 10, 35, 24, 5); // dispenser slot
    px(g, 0x3aa0c0, 14, 35, 4, 5); // bottle hint
    g.generateTexture('prop-soda', 44, 46);
    g.destroy();
  }
}

export function generateAllTextures(scene) {
  buildShared(scene);
  buildProps(scene);
  for (const band of getRoster()) {
    const look = LOOKS[band.id] || LOOKS['blink-182'];
    if (!band.characterSprite && !scene.textures.exists(skaterKey(band.id))) {
      buildSkater(scene, skaterKey(band.id), look, band.themeColor);
    }
    if (!band.logoAsset && !scene.textures.exists(logoKey(band.id))) {
      buildLogoBadge(scene, logoKey(band.id), band.themeColor, band.accentColor);
    }
  }
}

export function skaterKey(id) {
  const band = getRoster().find((b) => b.id === id);
  return band?.characterSprite || `skater-${id}`;
}
export function logoKey(id) {
  const band = getRoster().find((b) => b.id === id);
  return band?.logoAsset || `logo-${id}`;
}

export { hex };
