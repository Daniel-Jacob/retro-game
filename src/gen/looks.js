// Per-band character "signature look" (spec: band-selection — recognizable,
// distinct characters). Original stylized art params only — no real likenesses.
// The generator in textures.js interprets these. Tweak here to re-style a band.
//
// Fields:
//   skin     base skin tone
//   hair     { style: 'short'|'spike'|'beanie'|'cap'|'long', color, streak? }
//   shirt    { style: 'tee'|'tie'|'hoodie'|'tank', color }   (color often = theme)
//   pants    color
//   accessory 'wristband' | 'chain' | 'eyeliner' | 'none'
//   deck     skateboard deck color (graphic accent)

export const LOOKS = {
  'blink-182': {
    skin: 0xf1c8a0,
    hair: { style: 'short', color: 0x7a5230 },
    shirt: { style: 'tee', color: 0xff4fa3 },
    pants: 0x33343f,
    accessory: 'wristband',
    deck: 0x2bd1fc,
  },
  'green-day': {
    skin: 0xefc59a,
    hair: { style: 'spike', color: 0x111016 },
    shirt: { style: 'tie', color: 0x161616 },
    pants: 0x222028,
    accessory: 'eyeliner',
    deck: 0xff2d2d,
  },
  'linkin-park': {
    skin: 0xe8b98c,
    hair: { style: 'beanie', color: 0x1b1b1b },
    shirt: { style: 'hoodie', color: 0xff7a00 },
    pants: 0x2a2a30,
    accessory: 'none',
    deck: 0x1a1a1a,
  },
  'sum-41': {
    skin: 0xf1c8a0,
    hair: { style: 'cap', color: 0xf5d442 },
    shirt: { style: 'tee', color: 0x202024 },
    pants: 0x3a3a44,
    accessory: 'chain',
    deck: 0xf5d442,
  },
  'avril-lavigne': {
    skin: 0xf3cda6,
    hair: { style: 'long', color: 0x1a1620, streak: 0xd23bff },
    shirt: { style: 'tank', color: 0x1d1d22 },
    pants: 0x2c2c34,
    accessory: 'none',
    deck: 0xd23bff,
  },
};

// One-word vibe shown on the selection card.
export const DESCRIPTORS = {
  'blink-182': 'SoCal skate-punk',
  'green-day': 'Snotty punk attitude',
  'linkin-park': 'Nu-metal angst',
  'sum-41': 'Skatepark goofballs',
  'avril-lavigne': 'Sk8er anthem',
};
