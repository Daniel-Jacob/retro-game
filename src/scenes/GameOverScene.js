import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getBand } from '../config/bandConfig.js';
import { skaterKey } from '../gen/textures.js';
import { getAudio } from '../audio/AudioManager.js';
import { REG } from '../state.js';
import { PALETTE, makeText, panel, button, crtOverlay, transition, fadeIn, hexStr } from '../ui/theme.js';

// Game over: final score + band theme, replay back to band selection.
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const bandId = this.registry.get(REG.SELECTED_BAND);
    const band = getBand(bandId) || { displayName: '—', themeColor: 0xffffff };
    const score = this.registry.get(REG.LAST_SCORE) || 0;
    const crashed = !!this.registry.get(REG.CRASHED);

    fadeIn(this);
    getAudio(this).stop();

    this.cameras.main.setBackgroundColor(PALETTE.bgCss);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, band.themeColor, 0.06).setOrigin(0, 0);

    const cx = GAME_WIDTH / 2;
    panel(this, cx - 230, 90, 460, 340, { radius: 18, alpha: 0.95 });

    if (bandId) {
      this.add.image(cx, 190, skaterKey(bandId)).setScale(1.4);
    }

    makeText(this, cx, 270, crashed ? 'WIPEOUT!' : 'RUN OVER', 'title', {
      color: crashed ? PALETTE.bad : hexStr(band.themeColor),
    }).setOrigin(0.5);
    makeText(this, cx, 312, crashed ? `${band.displayName} — you hit a hazard` : band.displayName, 'body', {
      color: PALETTE.inkDim,
    }).setOrigin(0.5);
    makeText(this, cx, 352, `FINAL SCORE   ${score}`, 'heading').setOrigin(0.5);

    const replay = () => {
      this.registry.set(REG.LAST_SCORE, 0);
      this.registry.set(REG.CRASHED, false);
      transition(this, 'BandSelectScene');
    };
    button(this, cx, 410, '▶  PLAY AGAIN', { accent: band.themeColor, onClick: replay });
    this.input.keyboard.on('keydown-ENTER', replay);
    this.input.keyboard.on('keydown-SPACE', replay);

    crtOverlay(this);
  }
}
