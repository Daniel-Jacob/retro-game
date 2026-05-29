// Shared modern-retro UI theme (spec: ui-theme).
//
// One source of truth for palette, fonts, reusable component factories, the
// CRT/scanline overlay, and scene transitions. Every scene imports from here so
// the look stays consistent. Aesthetic: cleaner arcade/CRT — crisp text, dark
// surfaces, neon-ish theme accents, subtle scanlines + vignette + glow.

import Phaser from 'phaser';

// Bundled fonts (OFL, via @fontsource) — imported here so any scene using the
// theme pulls them in. CSS family names below must match these.
import '@fontsource/orbitron/500.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/900.css';
import '@fontsource/chakra-petch/400.css';
import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/700.css';

export const FONT_DISPLAY = 'Orbitron';
export const FONT_BODY = 'Chakra Petch';

// Crank CRT effects down/off here if they ever hurt readability.
export const CRT_INTENSITY = 1;

export const PALETTE = {
  bg: 0x0b0b14,
  bgCss: '#0b0b14',
  surface: 0x16161f,
  surfaceLight: 0x20202e,
  stroke: 0x33334a,
  ink: '#f4f4fb',
  inkDim: '#aab',
  muted: '#7a7a93',
  good: '#9affb0',
  bad: '#ff6b6b',
};

const hexStr = (n) => `#${(n >>> 0).toString(16).padStart(6, '0').slice(-6)}`;

// --- text helpers ----------------------------------------------------------
// kind: 'title' | 'heading' | 'body' | 'small' | 'hud'
// Crispness comes from the high 960x540 base resolution + smooth canvas upscale
// (index.html image-rendering:auto); we deliberately avoid Text.setResolution(),
// which miscomputes width/centering in this Phaser build.
export function makeText(scene, x, y, str, kind = 'body', overrides = {}) {
  const styles = {
    title: { fontFamily: FONT_DISPLAY, fontStyle: '900', fontSize: '40px', color: PALETTE.ink },
    heading: { fontFamily: FONT_DISPLAY, fontStyle: '700', fontSize: '20px', color: PALETTE.ink },
    body: { fontFamily: FONT_BODY, fontStyle: '500', fontSize: '16px', color: PALETTE.ink },
    small: { fontFamily: FONT_BODY, fontStyle: '400', fontSize: '13px', color: PALETTE.muted },
    hud: { fontFamily: FONT_DISPLAY, fontStyle: '700', fontSize: '18px', color: PALETTE.ink },
  };
  return scene.add.text(x, y, str, { ...styles[kind], ...overrides });
}

// --- component factories ---------------------------------------------------
// A themed panel (rounded surface + stroke). Returns the Graphics object.
export function panel(scene, x, y, w, h, { fill = PALETTE.surface, stroke = PALETTE.stroke, lineWidth = 2, radius = 12, alpha = 1 } = {}) {
  const g = scene.add.graphics();
  g.fillStyle(fill, alpha);
  g.fillRoundedRect(x, y, w, h, radius);
  if (lineWidth > 0) {
    g.lineStyle(lineWidth, stroke, 1);
    g.strokeRoundedRect(x, y, w, h, radius);
  }
  return g;
}

// A clickable text button on a themed pill. Returns { bg, label, container set helpers }.
export function button(scene, x, y, str, { accent = 0x2bd1fc, onClick } = {}) {
  const label = makeText(scene, x, y, str, 'heading', { color: hexStr(accent) }).setOrigin(0.5);
  const padX = 22;
  const padY = 12;
  const w = label.width + padX * 2;
  const h = label.height + padY * 2;
  const bg = scene.add.graphics();
  const draw = (hover) => {
    bg.clear();
    bg.fillStyle(PALETTE.surfaceLight, 1);
    bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    bg.lineStyle(hover ? 3 : 2, accent, hover ? 1 : 0.7);
    bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
  };
  draw(false);
  label.setDepth(1);
  const zone = scene.add
    .zone(x, y, w, h)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => draw(true))
    .on('pointerout', () => draw(false))
    .on('pointerdown', () => onClick && onClick());
  return { bg, label, zone };
}

// --- CRT / scanline overlay ------------------------------------------------
// Draws faint scanlines + a vignette on a screen-fixed top layer. Cheap (drawn
// once). Returns the container so callers can tweak/destroy it.
export function crtOverlay(scene) {
  if (CRT_INTENSITY <= 0) return null;
  const { width, height } = scene.scale;
  const c = scene.add.container(0, 0).setDepth(9999).setScrollFactor(0);

  const lines = scene.add.graphics();
  lines.fillStyle(0x000000, 0.16 * CRT_INTENSITY);
  for (let y = 0; y < height; y += 3) lines.fillRect(0, y, width, 1);
  c.add(lines);

  // Vignette: four edge gradients faked with stacked translucent rects.
  const vg = scene.add.graphics();
  const steps = 18;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * 0.5 * CRT_INTENSITY;
    vg.fillStyle(0x000000, a / steps + 0.004);
    const inset = i * 6;
    vg.strokeRect?.(0, 0, width, height);
    vg.fillRect(0, inset, width, 2); // top
    vg.fillRect(0, height - inset - 2, width, 2); // bottom
    vg.fillRect(inset, 0, 2, height); // left
    vg.fillRect(width - inset - 2, 0, 2, height); // right
  }
  c.add(vg);
  return c;
}

// --- scene transition ------------------------------------------------------
// Smooth fade-out, start the next scene, fade-in (the next scene fades itself in
// on create via fadeIn()). Keeps continuity instead of a hard cut.
export function transition(scene, toKey, data, duration = 260) {
  scene.cameras.main.fadeOut(duration, 11, 11, 20);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(toKey, data);
  });
}

// Call at the top of a scene's create() so it eases in.
export function fadeIn(scene, duration = 240) {
  scene.cameras.main.fadeIn(duration, 11, 11, 20);
}

// --- font readiness --------------------------------------------------------
// Resolve once the theme fonts are ready so text never renders in a fallback
// then pops. Non-fatal: resolves anyway on timeout/failure.
export async function fontsReady() {
  if (typeof document === 'undefined' || !document.fonts) return;
  const wanted = [
    `700 24px "${FONT_DISPLAY}"`,
    `900 44px "${FONT_DISPLAY}"`,
    `500 16px "${FONT_BODY}"`,
    `700 18px "${FONT_BODY}"`,
  ];
  try {
    await Promise.race([
      Promise.all(wanted.map((f) => document.fonts.load(f))).then(() => document.fonts.ready),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch {
    /* non-fatal — system fallback */
  }
}

export { hexStr };
