import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { validateRoster, BandConfigError } from '../config/bandConfig.js';
import { generateAllTextures } from '../gen/textures.js';
import { getAudio } from '../audio/AudioManager.js';

// Boot/loading scene (tasks 3.1, 3.2): validate config, build textures, init the
// shared audio manager, then advance to band selection — or show a readable
// error if the band roster is missing/empty (spec: game-shell).
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const loading = this.add
      .text(cx, cy, 'LOADING…', {
        fontFamily: 'Courier New, monospace',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    try {
      validateRoster();
      generateAllTextures(this);
      getAudio(this); // create the singleton early (still silent until selection)
    } catch (err) {
      loading.destroy();
      this.showError(err);
      return;
    }

    // Brief beat on the loading indicator, then start the menu.
    this.time.delayedCall(350, () => this.scene.start('BandSelectScene'));
  }

  showError(err) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const msg =
      err instanceof BandConfigError
        ? err.message
        : 'Something went wrong while loading the game.';
    this.cameras.main.setBackgroundColor('#2a0d12');
    this.add
      .text(cx, cy - 16, '⚠  GAME CONFIG ERROR', {
        fontFamily: 'Courier New, monospace',
        fontSize: '20px',
        color: '#ff6b6b',
      })
      .setOrigin(0.5);
    this.add
      .text(cx, cy + 16, msg, {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: '#ffd0d0',
        align: 'center',
        wordWrap: { width: GAME_WIDTH - 80 },
      })
      .setOrigin(0.5);
  }
}
