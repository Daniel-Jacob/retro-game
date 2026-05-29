import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getBand } from '../config/bandConfig.js';
import { skaterKey, logoKey, hex } from '../gen/textures.js';
import { getAudio } from '../audio/AudioManager.js';
import { REG } from '../state.js';

const HALL_LENGTH = 2200;
const FLOOR_Y = GAME_HEIGHT - 40;

// Graffiti hallway intro (tasks 5.1–5.4): the selected band's logo is painted
// repeatedly along the wall; the skater rolls to the end (or presses ENTER) to
// drop into the skate level. Band music begins here — the first scene after the
// user's selection gesture.
export class HallwayScene extends Phaser.Scene {
  constructor() {
    super('HallwayScene');
  }

  create() {
    const bandId = this.registry.get(REG.SELECTED_BAND);
    const band = getBand(bandId);

    // Guard: no valid selection → back to the menu (task 5.2 / spec).
    if (!band) {
      this.scene.start('BandSelectScene');
      return;
    }

    // Start theme music now (task 5.4). Uses the selection click as the gesture.
    getAudio(this).playBand(bandId);

    this.cameras.main.setBounds(0, 0, HALL_LENGTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#101018');

    // Back wall + floor.
    this.add.rectangle(0, 0, HALL_LENGTH, FLOOR_Y, 0x1b1b28).setOrigin(0, 0);
    this.add.rectangle(0, FLOOR_Y, HALL_LENGTH, GAME_HEIGHT - FLOOR_Y, 0x2a2a38).setOrigin(0, 0);

    // Repeated logo graffiti with the band initials overlaid (task 5.1).
    for (let x = 160; x < HALL_LENGTH - 120; x += 360) {
      const y = 120 + (x % 720 === 160 ? 0 : 20);
      const badge = this.add.image(x, y, logoKey(bandId)).setScale(1.1);
      badge.setAngle(Phaser.Math.Between(-6, 6));
      this.add
        .text(x, y - 2, band.initials, {
          fontFamily: 'Courier New, monospace',
          fontSize: '34px',
          fontStyle: 'bold',
          color: hex(band.accentColor),
        })
        .setOrigin(0.5)
        .setAngle(badge.angle);
    }

    // Tag line.
    this.add
      .text(40, 40, `${band.displayName.toUpperCase()} — HALLWAY`, {
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        color: hex(band.themeColor),
      })
      .setScrollFactor(0);

    // Skater (physics body, no gravity in the hallway).
    this.skater = this.physics.add.image(60, FLOOR_Y - 24, skaterKey(bandId)).setScale(1.6);
    this.skater.body.setAllowGravity(false);
    this.cameras.main.startFollow(this.skater, true, 0.1, 0.1);

    // HUD prompt.
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 22, '→  skate to the end     ENTER to drop in', {
        fontFamily: 'Courier New, monospace',
        fontSize: '13px',
        color: '#9a9ab0',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-ENTER', () => this.toSkate());
    this.input.keyboard.on('keydown-SPACE', () => this.toSkate());

    this.done = false;
  }

  toSkate() {
    if (this.done) return;
    this.done = true;
    this.scene.start('SkateScene');
  }

  update() {
    if (!this.skater) return;
    const speed = 240;
    if (this.cursors.left.isDown) {
      this.skater.setVelocityX(-speed);
      this.skater.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.skater.setVelocityX(speed);
      this.skater.setFlipX(false);
    } else {
      this.skater.setVelocityX(0);
    }
    // Reaching the end of the corridor drops into the skate level (task 5.3).
    if (this.skater.x >= HALL_LENGTH - 80) this.toSkate();
  }
}
