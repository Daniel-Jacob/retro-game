import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { validateRoster, BandConfigError } from '../config/bandConfig.js';
import { generateAllTextures } from '../gen/textures.js';
import { getAudio } from '../audio/AudioManager.js';
import { PALETTE, makeText, fontsReady, transition } from '../ui/theme.js';

// Boot/loading scene: load fonts (so text doesn't pop), validate config, build
// textures, init audio, then transition to band selection — or show a readable
// error if the band roster is missing/empty.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    this.cameras.main.setBackgroundColor(PALETTE.bgCss);

    const title = makeText(this, cx, cy - 26, 'POP-PUNK SKATE', 'title').setOrigin(0.5);
    title.setAlpha(0.96);
    const loading = makeText(this, cx, cy + 30, 'LOADING…', 'small').setOrigin(0.5);
    this.tweens.add({ targets: loading, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    this.boot();
  }

  async boot() {
    try {
      await fontsReady();
      validateRoster();
      generateAllTextures(this);
      getAudio(this);
    } catch (err) {
      this.showError(err);
      return;
    }
    this.time.delayedCall(250, () => transition(this, 'BandSelectScene'));
  }

  showError(err) {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const msg =
      err instanceof BandConfigError ? err.message : 'Something went wrong while loading the game.';
    this.cameras.main.setBackgroundColor('#2a0d12');
    this.children.removeAll();
    makeText(this, cx, cy - 18, '⚠  GAME CONFIG ERROR', 'heading', { color: PALETTE.bad }).setOrigin(0.5);
    makeText(this, cx, cy + 18, msg, 'body', {
      color: '#ffd0d0',
      align: 'center',
      wordWrap: { width: GAME_WIDTH - 120 },
    }).setOrigin(0.5);
  }
}
