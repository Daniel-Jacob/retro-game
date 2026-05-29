import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getRoster } from '../config/bandConfig.js';
import { skaterKey, hex } from '../gen/textures.js';
import { REG } from '../state.js';

// Band selection (tasks 4.1–4.4): show the five band characters, support
// keyboard + pointer selection, then lock in the theme and enter the hallway.
export class BandSelectScene extends Phaser.Scene {
  constructor() {
    super('BandSelectScene');
  }

  create() {
    this.roster = getRoster();
    this.index = 0;
    this.cards = [];

    this.cameras.main.setBackgroundColor('#15151f');
    this.add
      .text(GAME_WIDTH / 2, 34, 'PICK YOUR BAND', {
        fontFamily: 'Courier New, monospace',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 64, '← →  to choose    ENTER / click to skate', {
        fontFamily: 'Courier New, monospace',
        fontSize: '13px',
        color: '#8a8aa0',
      })
      .setOrigin(0.5);

    const n = this.roster.length;
    const slot = GAME_WIDTH / n;
    this.roster.forEach((band, i) => {
      const x = slot * i + slot / 2;
      const y = GAME_HEIGHT / 2 + 10;

      const card = this.add.rectangle(x, y, slot - 16, 190, 0x20202c).setStrokeStyle(3, 0x35354a);
      const sprite = this.add.image(x, y - 18, skaterKey(band.id)).setScale(2.2);
      const label = this.add
        .text(x, y + 74, band.displayName, {
          fontFamily: 'Courier New, monospace',
          fontSize: '14px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: slot - 24 },
        })
        .setOrigin(0.5);

      // Pointer/tap selection (task 4.3).
      card
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.setIndex(i))
        .on('pointerdown', () => {
          this.setIndex(i);
          this.confirm();
        });

      this.cards.push({ band, card, sprite, label });
    });

    // Keyboard navigation (task 4.2).
    this.input.keyboard.on('keydown-LEFT', () => this.move(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-SPACE', () => this.confirm());

    this.setIndex(0);
  }

  move(dir) {
    const n = this.roster.length;
    this.setIndex((this.index + dir + n) % n);
  }

  // Highlight the focused option (task 4.2 focus highlight).
  setIndex(i) {
    this.index = i;
    this.cards.forEach((c, idx) => {
      const active = idx === i;
      const theme = c.band.themeColor;
      c.card.setStrokeStyle(active ? 5 : 3, active ? theme : 0x35354a);
      c.card.setFillStyle(active ? 0x2b2b3c : 0x20202c);
      c.label.setColor(active ? hex(theme) : '#ffffff');
      this.tweens.add({ targets: c.sprite, scale: active ? 2.6 : 2.2, duration: 120 });
    });
  }

  // Lock in the selection: store band id (task 4.4 / 3.4) and enter hallway.
  confirm() {
    const band = this.roster[this.index];
    this.registry.set(REG.SELECTED_BAND, band.id);
    // NOTE: audio is started in HallwayScene — this click is the user gesture
    // that unlocks autoplay, and the hallway is the first post-selection scene.
    this.scene.start('HallwayScene');
  }
}
