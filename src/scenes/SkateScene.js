import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getBand } from '../config/bandConfig.js';
import { skaterKey, hex } from '../gen/textures.js';
import { getAudio } from '../audio/AudioManager.js';
import { REG } from '../state.js';

const WORLD_W = 4200;
const FLOOR_TOP = GAME_HEIGHT - 36; // y of the top surface of the ground
const RUN_SECONDS = 75;
const TRICK_MS = 420; // time a trick takes to land cleanly

// Core skate gameplay (tasks 6.1–6.8). Side-scrolling level with movement,
// ramps (launch), grindable rails, air tricks, a combo multiplier, a HUD, and a
// goal/timer end condition.
export class SkateScene extends Phaser.Scene {
  constructor() {
    super('SkateScene');
  }

  create() {
    const bandId = this.registry.get(REG.SELECTED_BAND);
    this.band = getBand(bandId);
    if (!this.band) {
      this.scene.start('BandSelectScene');
      return;
    }

    getAudio(this).playBand(bandId); // keep the music going (no-op if already on)

    // --- run state ---
    this.score = 0;
    this.combo = 0; // pending points accrued since last clean landing
    this.multiplier = 1;
    this.grinding = false;
    this.grindRailEnd = 0;
    this.grindCooldown = 0;
    this.trickActive = false;
    this.airborne = false;
    this.ended = false;

    this.buildWorld();
    this.buildPlayer();
    this.buildInput();
    this.buildHud();

    // Run timer fallback end condition (task 6.8).
    this.timeLeft = RUN_SECONDS;
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.ended) return;
        this.timeLeft -= 1;
        if (this.timeLeft <= 0) this.endRun();
      },
    });
  }

  // ---- world / level (task 6.1, 6.3, 6.4) --------------------------------
  buildWorld() {
    this.cameras.main.setBounds(0, 0, WORLD_W, GAME_HEIGHT);
    this.physics.world.setBounds(0, 0, WORLD_W, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#181826');

    // Parallax-ish back band-color glow strip.
    this.add.rectangle(0, 60, WORLD_W, 90, this.band.themeColor, 0.08).setOrigin(0, 0);

    // Visual + solid floor.
    this.add.tileSprite(0, FLOOR_TOP, WORLD_W, 36, 'ground').setOrigin(0, 0);
    this.solids = this.physics.add.staticGroup();
    this.addSolid(WORLD_W / 2, FLOOR_TOP + 18, WORLD_W, 36);

    // A raised platform to skate onto.
    this.add.tileSprite(1500, FLOOR_TOP - 90, 320, 16, 'ground').setOrigin(0, 0);
    this.addSolid(1500 + 160, FLOOR_TOP - 90 + 8, 320, 16);

    // Ramps — visual wedge + an overlap launch zone (task 6.3).
    this.launchZones = this.physics.add.staticGroup();
    this.addRamp(820, false); // launch up-right
    this.addRamp(2550, false);
    this.addRamp(3300, true); // mirrored

    // Grind rails — visual bar + a thin top sensor zone (task 6.4).
    this.grindZones = this.physics.add.staticGroup();
    this.addRail(1180, FLOOR_TOP - 70, 260);
    this.addRail(2000, FLOOR_TOP - 60, 300);
    this.addRail(2900, FLOOR_TOP - 96, 240);

    // Goal flag at the end (task 6.8).
    this.goal = this.physics.add.staticImage(WORLD_W - 80, FLOOR_TOP - 40, 'goal');
  }

  addSolid(cx, cy, w, h) {
    const r = this.add.rectangle(cx, cy, w, h, 0x000000, 0);
    this.physics.add.existing(r, true);
    this.solids.add(r);
    return r;
  }

  addRamp(x, mirrored) {
    const img = this.add.image(x, FLOOR_TOP, 'ramp').setOrigin(0, 1);
    img.setFlipX(mirrored);
    // Launch zone sits over the ramp face.
    const zone = this.add.rectangle(x + 32, FLOOR_TOP - 32, 64, 64, 0x000000, 0);
    this.physics.add.existing(zone, true);
    zone.launchDir = mirrored ? -1 : 1;
    this.launchZones.add(zone);
  }

  addRail(x, topY, len) {
    this.add.tileSprite(x, topY, len, 10, 'rail').setOrigin(0, 0);
    // Posts.
    this.add.rectangle(x + 6, topY + 5, 4, FLOOR_TOP - topY, 0x80808c).setOrigin(0.5, 0);
    this.add.rectangle(x + len - 6, topY + 5, 4, FLOOR_TOP - topY, 0x80808c).setOrigin(0.5, 0);
    const zone = this.add.rectangle(x + len / 2, topY - 2, len, 12, 0x000000, 0);
    this.physics.add.existing(zone, true);
    zone.railTop = topY;
    zone.railEnd = x + len;
    this.grindZones.add(zone);
  }

  // ---- player (task 6.2) -------------------------------------------------
  buildPlayer() {
    this.player = this.physics.add.sprite(80, FLOOR_TOP - 60, skaterKey(this.registry.get(REG.SELECTED_BAND)));
    this.player.setScale(1.2);
    this.player.body.setSize(26, 42).setOffset(5, 4);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(420, 1400);

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.overlap(this.player, this.launchZones, (_p, z) => this.tryLaunch(z));
    this.physics.add.overlap(this.player, this.grindZones, (_p, z) => this.tryGrind(z));
    this.physics.add.overlap(this.player, this.goal, () => this.endRun());

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 80);
  }

  buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      trickA: Phaser.Input.Keyboard.KeyCodes.Z,
      trickB: Phaser.Input.Keyboard.KeyCodes.X,
      mute: Phaser.Input.Keyboard.KeyCodes.M,
    });
    this.input.keyboard.on('keydown-UP', () => this.jump());
    this.keys.jump.on('down', () => this.jump());
    this.keys.trickA.on('down', () => this.doTrick('kickflip', 360));
    this.keys.trickB.on('down', () => this.doTrick('grab', -360));
    this.keys.mute.on('down', () => this.toggleMute());
  }

  // ---- HUD (task 6.7) + mute control (task 7.4) --------------------------
  buildHud() {
    const style = { fontFamily: 'Courier New, monospace', fontSize: '16px', color: '#ffffff' };
    this.scoreText = this.add.text(12, 10, '', style).setScrollFactor(0);
    this.comboText = this.add
      .text(12, 30, '', { ...style, fontSize: '14px', color: hex(this.band.themeColor) })
      .setScrollFactor(0);
    this.timerText = this.add
      .text(GAME_WIDTH - 12, 10, '', style)
      .setOrigin(1, 0)
      .setScrollFactor(0);

    this.muteBtn = this.add
      .text(GAME_WIDTH - 12, 32, '', { ...style, fontSize: '13px', color: '#9a9ab0' })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleMute());
    this.refreshMuteLabel();

    this.flash = this.add
      .text(GAME_WIDTH / 2, 90, '', {
        fontFamily: 'Courier New, monospace',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setAlpha(0);
  }

  refreshMuteLabel() {
    this.muteBtn.setText(getAudio(this).isMuted() ? '[M] sound: OFF' : '[M] sound: ON');
  }

  toggleMute() {
    getAudio(this).toggleMute();
    this.refreshMuteLabel();
  }

  // ---- actions -----------------------------------------------------------
  jump() {
    if (this.ended) return;
    if (this.grinding) {
      this.exitGrind();
      this.player.setVelocityY(-520);
      return;
    }
    if (this.player.body.blocked.down || this.player.body.touching.down) {
      this.player.setVelocityY(-560);
    }
  }

  tryLaunch(zone) {
    if (this.ended || this.grinding) return;
    if (!(this.player.body.blocked.down || this.player.body.touching.down)) return;
    const speed = Math.abs(this.player.body.velocity.x);
    if (speed < 120) return; // need momentum to launch (spec)
    this.player.setVelocityY(-720);
    this.player.setVelocityX(zone.launchDir * Math.max(260, speed));
    this.showFlash('RAMP!');
  }

  tryGrind(zone) {
    if (this.ended || this.grinding) return;
    if (this.grindCooldown > 0) return;
    // Must be coming down onto the rail top with horizontal speed (spec 6.4).
    if (this.player.body.velocity.y < -20) return;
    if (Math.abs(this.player.body.velocity.x) < 60) return;
    this.enterGrind(zone);
  }

  enterGrind(zone) {
    this.grinding = true;
    this.grindRailEnd = zone.railEnd;
    this.player.body.setAllowGravity(false);
    this.player.setVelocityY(0);
    this.player.y = zone.railTop - this.player.body.halfHeight - 2;
    this.multiplier += 1; // entering a grind extends the combo chain
    this.showFlash('GRIND!');
  }

  exitGrind() {
    if (!this.grinding) return;
    this.grinding = false;
    this.grindCooldown = 250;
    this.player.body.setAllowGravity(true);
  }

  doTrick(_name, spin = 360) {
    if (this.ended || this.grinding) return;
    if (this.player.body.blocked.down || this.player.body.touching.down) return; // air only
    if (this.trickActive) return;
    this.trickActive = true;
    this.trickStart = this.time.now;
    this.tweens.add({
      targets: this.player,
      angle: this.player.angle + spin,
      duration: TRICK_MS,
      onComplete: () => {
        if (!this.trickActive) return;
        // Landed-in-air completion: bank trick points into the pending combo.
        this.trickActive = false;
        this.player.setAngle(0);
        this.combo += 100;
        this.multiplier += 1;
        this.showFlash('+TRICK');
      },
    });
  }

  bail() {
    // Landed while a trick was still in progress (spec 6.6).
    this.trickActive = false;
    this.player.setAngle(0);
    this.combo = 0;
    this.multiplier = 1;
    this.showFlash('BAIL!', '#ff6b6b');
  }

  bankCombo() {
    if (this.combo <= 0) {
      this.multiplier = 1;
      return;
    }
    const gained = this.combo * this.multiplier;
    this.score += gained;
    this.showFlash(`+${gained}`, hex(this.band.themeColor));
    this.combo = 0;
    this.multiplier = 1;
  }

  showFlash(text, color = '#ffffff') {
    this.flash.setText(text).setColor(color).setAlpha(1).setScale(1);
    this.tweens.add({ targets: this.flash, alpha: 0, scale: 1.4, duration: 600 });
  }

  endRun() {
    if (this.ended) return;
    this.ended = true;
    this.bankCombo();
    this.registry.set(REG.LAST_SCORE, this.score);
    this.time.delayedCall(400, () => this.scene.start('GameOverScene'));
  }

  // ---- loop (task 6.2 movement + state transitions) ----------------------
  update(time, delta) {
    if (this.ended || !this.player) return;
    if (this.grindCooldown > 0) this.grindCooldown -= delta;

    const grounded = this.player.body.blocked.down || this.player.body.touching.down;

    // Grinding: lock to rail, accrue score, exit at rail end.
    if (this.grinding) {
      this.player.setVelocityY(0);
      if (this.player.body.velocity.x === 0) this.player.setVelocityX(220 * (this.player.flipX ? -1 : 1));
      this.combo += Math.round((delta / 1000) * 60); // score over duration
      if (this.player.x >= this.grindRailEnd) this.exitGrind();
    } else {
      // Horizontal movement (task 6.2).
      const accel = grounded ? 900 : 500;
      if (this.cursors.left.isDown) {
        this.player.setAccelerationX(-accel);
        this.player.setFlipX(true);
      } else if (this.cursors.right.isDown) {
        this.player.setAccelerationX(accel);
        this.player.setFlipX(false);
      } else {
        this.player.setAccelerationX(0);
        if (grounded) this.player.setVelocityX(this.player.body.velocity.x * 0.86);
      }
    }

    // Landing transitions.
    if (grounded && !this.grinding) {
      if (this.trickActive && time - this.trickStart < TRICK_MS - 40) {
        this.bail(); // landed mid-trick
      } else if (this.airborne) {
        this.bankCombo(); // clean landing banks the chain
      }
      this.airborne = false;
    } else if (!grounded && !this.grinding) {
      this.airborne = true;
    }

    // HUD.
    this.scoreText.setText(`SCORE ${this.score}`);
    this.comboText.setText(this.combo > 0 ? `COMBO ${this.combo} x${this.multiplier}` : '');
    this.timerText.setText(`TIME ${Math.max(0, this.timeLeft)}`);
  }
}
