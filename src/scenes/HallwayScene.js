import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getBand } from '../config/bandConfig.js';
import { skaterKey, logoKey } from '../gen/textures.js';
import { getAudio } from '../audio/AudioManager.js';
import { REG } from '../state.js';
import { PALETTE, makeText, crtOverlay, transition, fadeIn, hexStr } from '../ui/theme.js';

const HALL_LENGTH = 2800;
const FLOOR_Y = GAME_HEIGHT - 56;

// Graffiti hallway intro: the selected band's logo is painted along the wall;
// the skater rolls to the end (or presses ENTER) to drop into the skate level.
// Band music begins here.
export class HallwayScene extends Phaser.Scene {
  constructor() {
    super('HallwayScene');
  }

  create() {
    const bandId = this.registry.get(REG.SELECTED_BAND);
    const band = getBand(bandId);
    if (!band) {
      this.scene.start('BandSelectScene');
      return;
    }

    fadeIn(this);
    getAudio(this).playBand(bandId);

    this.cameras.main.setBounds(0, 0, HALL_LENGTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#0e0e16');

    this.add.rectangle(0, 0, HALL_LENGTH, FLOOR_Y, 0x16161f).setOrigin(0, 0);
    this.add.rectangle(0, FLOOR_Y, HALL_LENGTH, GAME_HEIGHT - FLOOR_Y, 0x24242f).setOrigin(0, 0);
    this.add.rectangle(0, FLOOR_Y, HALL_LENGTH, 3, band.themeColor, 0.7).setOrigin(0, 0);

    // repeated logo graffiti with band initials overlaid
    for (let x = 220; x < HALL_LENGTH - 160; x += 440) {
      const y = 170 + ((x / 440) % 2 === 0 ? 0 : 26);
      const badge = this.add.image(x, y, logoKey(bandId)).setScale(1.1).setAngle(Phaser.Math.Between(-5, 5));
      makeText(this, x, y - 2, band.initials, 'title', { color: hexStr(band.accentColor), fontSize: '40px' })
        .setOrigin(0.5)
        .setAngle(badge.angle);
    }

    makeText(this, 28, 28, `${band.displayName.toUpperCase()}  ·  HALLWAY`, 'heading', {
      color: hexStr(band.themeColor),
    }).setScrollFactor(0);

    this.skater = this.physics.add.image(80, FLOOR_Y - 60, skaterKey(bandId)).setScale(1.0);
    this.skater.body.setAllowGravity(false);
    this.cameras.main.startFollow(this.skater, true, 0.1, 0.1);

    makeText(this, GAME_WIDTH / 2, GAME_HEIGHT - 30, '►  skate to the end      ENTER  drop in', 'small')
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-ENTER', () => this.toSkate());
    this.input.keyboard.on('keydown-SPACE', () => this.toSkate());

    crtOverlay(this);
    this.done = false;
  }

  toSkate() {
    if (this.done) return;
    this.done = true;
    transition(this, 'SkateScene');
  }

  update() {
    if (!this.skater) return;
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.skater.setVelocityX(-speed);
      this.skater.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.skater.setVelocityX(speed);
      this.skater.setFlipX(false);
    } else {
      this.skater.setVelocityX(0);
    }
    if (this.skater.x >= HALL_LENGTH - 100) this.toSkate();
  }
}
