import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getRoster } from '../config/bandConfig.js';
import { skaterKey } from '../gen/textures.js';
import { DESCRIPTORS } from '../gen/looks.js';
import { REG } from '../state.js';
import { PALETTE, makeText, crtOverlay, transition, fadeIn, hexStr } from '../ui/theme.js';

const CARD_W = 168;
const CARD_H = 304;

// Band selection: polished, themed character cards with focus glow + selected
// state. Each card shows a recognizable, distinct band character.
export class BandSelectScene extends Phaser.Scene {
  constructor() {
    super('BandSelectScene');
  }

  create() {
    fadeIn(this);
    this.cameras.main.setBackgroundColor(PALETTE.bgCss);
    this.roster = getRoster();
    this.index = 0;
    this.cards = [];
    this.locked = false;

    // backdrop accent band
    this.add.rectangle(0, 96, GAME_WIDTH, 200, 0x14141f).setOrigin(0, 0);

    makeText(this, GAME_WIDTH / 2, 50, 'PICK YOUR BAND', 'title').setOrigin(0.5);
    makeText(this, GAME_WIDTH / 2, 92, '◄  ►  choose      ENTER / click  to skate', 'small').setOrigin(0.5);

    const n = this.roster.length;
    const gap = 16;
    const totalW = n * CARD_W + (n - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2 + CARD_W / 2;
    const cy = 300;

    this.roster.forEach((band, i) => {
      const x = startX + i * (CARD_W + gap);
      this.cards.push(this.buildCard(band, x, cy, i));
    });

    this.input.keyboard.on('keydown-LEFT', () => this.move(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-SPACE', () => this.confirm());

    crtOverlay(this);
    this.setIndex(0);
  }

  buildCard(band, x, y, i) {
    const container = this.add.container(x, y);

    const glow = this.add.graphics();
    glow.fillStyle(band.themeColor, 0.22);
    glow.fillRoundedRect(-CARD_W / 2 - 8, -CARD_H / 2 - 8, CARD_W + 16, CARD_H + 16, 18);
    glow.setVisible(false);

    const bg = this.add.graphics();

    const sprite = this.add.image(0, -34, skaterKey(band.id)).setScale(1.55);

    const name = makeText(this, 0, 92, band.displayName, 'heading', {
      fontSize: '17px',
      align: 'center',
      wordWrap: { width: CARD_W - 12 },
    }).setOrigin(0.5);
    const desc = makeText(this, 0, 124, DESCRIPTORS[band.id] || '', 'small', {
      align: 'center',
      wordWrap: { width: CARD_W - 24 },
    }).setOrigin(0.5);

    container.add([glow, bg, sprite, name, desc]);

    const hit = this.add
      .zone(x, y, CARD_W, CARD_H)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.setIndex(i))
      .on('pointerdown', () => {
        this.setIndex(i);
        this.confirm();
      });

    return { band, container, glow, bg, sprite, name, desc, hit };
  }

  drawCardBg(card, active) {
    const { bg, band } = card;
    bg.clear();
    bg.fillStyle(active ? PALETTE.surfaceLight : PALETTE.surface, 1);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 14);
    bg.lineStyle(active ? 4 : 2, active ? band.themeColor : PALETTE.stroke, 1);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 14);
    // floor line under the character
    bg.fillStyle(band.themeColor, active ? 0.9 : 0.4);
    bg.fillRect(-CARD_W / 2 + 16, 60, CARD_W - 32, 3);
  }

  move(dir) {
    const n = this.roster.length;
    this.setIndex((this.index + dir + n) % n);
  }

  setIndex(i) {
    this.index = i;
    this.cards.forEach((card, idx) => {
      const active = idx === i;
      this.drawCardBg(card, active);
      card.glow.setVisible(active);
      card.name.setColor(active ? hexStr(card.band.themeColor) : PALETTE.ink);
      this.tweens.add({
        targets: card.container,
        scale: active ? 1.06 : 0.98,
        y: active ? 296 : 300,
        duration: 140,
        ease: 'Quad.out',
      });
    });
  }

  confirm() {
    if (this.locked) return;
    this.locked = true;
    const band = this.roster[this.index];
    this.registry.set(REG.SELECTED_BAND, band.id);
    // selection click is the user gesture; music starts in the hallway.
    transition(this, 'HallwayScene');
  }
}
