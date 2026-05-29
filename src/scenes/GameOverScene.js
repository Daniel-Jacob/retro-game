import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getBand } from '../config/bandConfig.js';
import { skaterKey, hex } from '../gen/textures.js';
import { getAudio } from '../audio/AudioManager.js';
import { REG } from '../state.js';

// Game over (tasks 8.1–8.3): show final score + band theme, offer replay back to
// band selection, and stop the music to cleanly end the run.
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const bandId = this.registry.get(REG.SELECTED_BAND);
    const band = getBand(bandId) || { displayName: '—', themeColor: 0xffffff };
    const score = this.registry.get(REG.LAST_SCORE) || 0;

    // Stop the track — the run is over (task 8.3).
    getAudio(this).stop();

    this.cameras.main.setBackgroundColor('#101018');
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, band.themeColor, 0.08).setOrigin(0, 0);

    if (bandId) {
      this.add.image(GAME_WIDTH / 2, 110, skaterKey(bandId)).setScale(2.6);
    }

    this.add
      .text(GAME_WIDTH / 2, 170, 'RUN OVER', {
        fontFamily: 'Courier New, monospace',
        fontSize: '34px',
        fontStyle: 'bold',
        color: hex(band.themeColor),
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 210, `${band.displayName}`, {
        fontFamily: 'Courier New, monospace',
        fontSize: '16px',
        color: '#c8c8d8',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 246, `FINAL SCORE  ${score}`, {
        fontFamily: 'Courier New, monospace',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const again = this.add
      .text(GAME_WIDTH / 2, 300, '▶  PLAY AGAIN', {
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        color: '#9affb0',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const replay = () => this.scene.start('BandSelectScene');
    again.on('pointerdown', replay);
    this.input.keyboard.on('keydown-ENTER', replay);
    this.input.keyboard.on('keydown-SPACE', replay);
  }
}
