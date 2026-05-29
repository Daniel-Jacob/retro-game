import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY_Y } from './constants.js';
import { BootScene } from './scenes/BootScene.js';
import { BandSelectScene } from './scenes/BandSelectScene.js';
import { HallwayScene } from './scenes/HallwayScene.js';
import { SkateScene } from './scenes/SkateScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0d0d12',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY_Y },
      debug: false,
    },
  },
  scene: [BootScene, BandSelectScene, HallwayScene, SkateScene, GameOverScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
