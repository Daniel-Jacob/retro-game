import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { getBand } from '../config/bandConfig.js';
import { skaterKey, logoKey, PROP_TYPES } from '../gen/textures.js';
import { getAudio } from '../audio/AudioManager.js';
import { REG } from '../state.js';
import { PALETTE, makeText, panel, crtOverlay, transition, fadeIn, hexStr } from '../ui/theme.js';
import { tripleForRamp, rampDims, THEOREM, formula, worked } from '../edu/pythagoras.js';

const WORLD_W = 5200;
const FLOOR_TOP = GAME_HEIGHT - 44; // y of the top surface of the ground
const RUN_SECONDS = 75;
const TRICK_MS = 420;

// Tuned for the 960x540 canvas + 1500 gravity.
const JUMP_V = -760;
const RAMP_V = -1040;
const GRIND_HOP_V = -740;

// Core skate gameplay. Side-scrolling level with movement, ramps (launch),
// grindable rails, air tricks, a combo multiplier, a HUD, and a goal/timer end.
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

    fadeIn(this);
    getAudio(this).playBand(bandId);

    this.score = 0;
    this.combo = 0;
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
    crtOverlay(this);

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

  buildWorld() {
    this.cameras.main.setBounds(0, 0, WORLD_W, GAME_HEIGHT);
    this.physics.world.setBounds(0, 0, WORLD_W, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#10101a');

    // layered band-color glow backdrop
    this.add.rectangle(0, 70, WORLD_W, 140, this.band.themeColor, 0.07).setOrigin(0, 0);
    this.add.rectangle(0, 150, WORLD_W, 90, this.band.themeColor, 0.05).setOrigin(0, 0);

    this.addGraffiti();

    this.add.tileSprite(0, FLOOR_TOP, WORLD_W, 44, 'ground').setOrigin(0, 0);
    this.add.rectangle(0, FLOOR_TOP, WORLD_W, 3, this.band.themeColor, 0.6).setOrigin(0, 0);
    this.solids = this.physics.add.staticGroup();
    this.addSolid(WORLD_W / 2, FLOOR_TOP + 22, WORLD_W, 44);

    // raised platform
    this.add.tileSprite(1900, FLOOR_TOP - 120, 360, 18, 'ground').setOrigin(0, 0);
    this.addSolid(1900 + 180, FLOOR_TOP - 120 + 9, 360, 18);

    // ramps (launch zones) — each is a right triangle sized to a Pythagorean
    // triple and labeled with the theorem (educational).
    this.launchZones = this.physics.add.staticGroup();
    this.addRamp(1000, false, 0);
    this.addRamp(3100, false, 1);
    this.addRamp(4100, true, 2);

    // grind rails
    this.grindZones = this.physics.add.staticGroup();
    this.addRail(1440, FLOOR_TOP - 90, 320);
    this.addRail(2500, FLOOR_TOP - 80, 360);
    this.addRail(3600, FLOOR_TOP - 120, 300);

    // retro prop obstacles — solid, clear them for a bonus. One sits just after
    // the first ramp (≈1000) so it can be cleared with a launch.
    this.clearZones = this.physics.add.staticGroup();
    this.addProp(1320, 0); // record (after ramp 1)
    this.addProp(2050, 1); // tape
    this.addProp(2950, 2); // soda
    this.addProp(4000, 0); // record (clear of rail at 3600–3900)

    this.goal = this.physics.add.staticImage(WORLD_W - 90, FLOOR_TOP - 48, 'goal');
  }

  // Band graffiti on the back wall — reuses the band's generated logo + tags,
  // behind gameplay (negative depth), scrolling with the world.
  addGraffiti() {
    const bandId = this.registry.get(REG.SELECTED_BAND);
    for (let x = 360; x < WORLD_W - 360; x += 720) {
      const badge = this.add
        .image(x, 150 + ((x / 720) % 2 === 0 ? 0 : 30), logoKey(bandId))
        .setScale(0.85)
        .setAlpha(0.5)
        .setAngle(Phaser.Math.Between(-5, 5))
        .setDepth(-3);
      makeText(this, badge.x, badge.y - 2, this.band.initials, 'title', {
        color: hexStr(this.band.accentColor),
        fontSize: '30px',
      })
        .setOrigin(0.5)
        .setAlpha(0.55)
        .setAngle(badge.angle)
        .setDepth(-3);
      // spray stripe tag
      this.add
        .rectangle(x + 300, 110 + ((x / 720) % 2 === 0 ? 40 : 0), 120, 8, this.band.themeColor, 0.18)
        .setAngle(-12)
        .setDepth(-3);
    }
  }

  // A solid retro prop placed on the floor + a "clear" sensor above it.
  addProp(x, typeIndex) {
    const def = PROP_TYPES[typeIndex % PROP_TYPES.length];
    const topY = FLOOR_TOP - def.h;
    const prop = this.solids.create(x, FLOOR_TOP - def.h / 2, def.key);
    prop.refreshBody();

    if (def.label) {
      makeText(this, x, topY + 14, def.label, 'small', { fontSize: '11px', color: '#1a1a1a' })
        .setOrigin(0.5)
        .setDepth(2);
    }

    // clear sensor sits just above the prop's top edge
    const zone = this.add.rectangle(x, topY - 16, def.w + 24, 26, 0x000000, 0);
    this.physics.add.existing(zone, true);
    zone.cleared = false;
    zone.bonus = 150;
    this.clearZones.add(zone);
  }

  addSolid(cx, cy, w, h) {
    const r = this.add.rectangle(cx, cy, w, h, 0x000000, 0);
    this.physics.add.existing(r, true);
    this.solids.add(r);
    return r;
  }

  addRamp(x, mirrored, tripleIndex = 0) {
    const t = tripleForRamp(tripleIndex);
    const { rise, run, hyp } = rampDims(t);

    // Right-triangle wedge. Base sits on the floor; the vertical (rise) leg is on
    // the lean side and the hypotenuse is the ride surface. Mirrored flips it so
    // the skater rides up going left.
    // Non-mirrored: tall on the right  →  ride up-right.
    // x of the vertical (rise) leg: right side when non-mirrored, left when mirrored.
    const bx = mirrored ? x : x + run;
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x5a4636, 1);
    g.lineStyle(3, this.band.themeColor, 0.9);
    g.beginPath();
    if (!mirrored) {
      g.moveTo(x, FLOOR_TOP); // bottom-left
      g.lineTo(x + run, FLOOR_TOP); // bottom-right
      g.lineTo(x + run, FLOOR_TOP - rise); // top-right (vertical leg)
    } else {
      g.moveTo(x, FLOOR_TOP); // bottom-left
      g.lineTo(x + run, FLOOR_TOP); // bottom-right
      g.lineTo(x, FLOOR_TOP - rise); // top-left (vertical leg)
    }
    g.closePath();
    g.fillPath();
    g.strokePath();

    // launch zone over the wedge
    const zone = this.add.rectangle(x + run / 2, FLOOR_TOP - rise / 2, run, rise, 0x000000, 0);
    this.physics.add.existing(zone, true);
    zone.launchDir = mirrored ? -1 : 1;
    this.launchZones.add(zone);

    this.addRampLabels(x, run, rise, hyp, t, mirrored, bx);
  }

  // Side labels (a/b/c with values) + a worked-formula card, anchored to the
  // world so they scroll with the ramp; depth below the HUD/CRT.
  addRampLabels(x, run, rise, hyp, t, mirrored, bx) {
    const D = 6;
    const side = (px, py, str) =>
      makeText(this, px, py, str, 'small', { color: PALETTE.ink, fontSize: '14px' })
        .setOrigin(0.5)
        .setDepth(D);

    // b = run (along the base)
    side(x + run / 2, FLOOR_TOP + 14, `b = ${t.b}`);
    // a = rise (beside the vertical leg)
    side(bx + (mirrored ? -16 : 16), FLOOR_TOP - rise / 2, `a = ${t.a}`);
    // c = hypotenuse (beside the incline midpoint)
    const cx = mirrored ? x + run / 2 + 14 : x + run / 2 - 14;
    side(cx, FLOOR_TOP - rise / 2 - 12, `c = ${t.c}`);

    // formula card above the ramp top
    const cardW = 188;
    const cardH = 80;
    const cardX = Phaser.Math.Clamp(x + run / 2 - cardW / 2, x - 30, x + run);
    const cardY = FLOOR_TOP - rise - cardH - 14;
    panel(this, cardX, cardY, cardW, cardH, { radius: 10, alpha: 0.92 }).setDepth(D);
    makeText(this, cardX + cardW / 2, cardY + 16, THEOREM, 'body', {
      color: hexStr(this.band.themeColor),
      fontSize: '17px',
    }).setOrigin(0.5).setDepth(D + 1);
    makeText(this, cardX + cardW / 2, cardY + 40, formula(t), 'body', { fontSize: '16px' })
      .setOrigin(0.5)
      .setDepth(D + 1);
    makeText(this, cardX + cardW / 2, cardY + 62, worked(t), 'small', { color: PALETTE.inkDim, fontSize: '14px' })
      .setOrigin(0.5)
      .setDepth(D + 1);
  }

  addRail(x, topY, len) {
    this.add.tileSprite(x, topY, len, 10, 'rail').setOrigin(0, 0);
    this.add.rectangle(x + 6, topY + 5, 4, FLOOR_TOP - topY, 0x80808c).setOrigin(0.5, 0);
    this.add.rectangle(x + len - 6, topY + 5, 4, FLOOR_TOP - topY, 0x80808c).setOrigin(0.5, 0);
    const zone = this.add.rectangle(x + len / 2, topY - 2, len, 14, 0x000000, 0);
    this.physics.add.existing(zone, true);
    zone.railTop = topY;
    zone.railEnd = x + len;
    this.grindZones.add(zone);
  }

  buildPlayer() {
    this.player = this.physics.add.sprite(90, FLOOR_TOP - 90, skaterKey(this.registry.get(REG.SELECTED_BAND)));
    this.player.setScale(0.82);
    // native sprite is 84x120; collide on the body, not the board/limbs.
    this.player.body.setSize(42, 104).setOffset(21, 8);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(480, 2000);

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.overlap(this.player, this.launchZones, (_p, z) => this.tryLaunch(z));
    this.physics.add.overlap(this.player, this.grindZones, (_p, z) => this.tryGrind(z));
    this.physics.add.overlap(this.player, this.clearZones, (_p, z) => this.tryClear(z));
    this.physics.add.overlap(this.player, this.goal, () => this.endRun());

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(180, 120);
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

  buildHud() {
    panel(this, 10, 10, 250, 56, { radius: 10, alpha: 0.9 }).setScrollFactor(0).setDepth(50);
    this.scoreText = makeText(this, 24, 18, '', 'hud').setScrollFactor(0).setDepth(51);
    this.comboText = makeText(this, 24, 42, '', 'small', { color: hexStr(this.band.themeColor) })
      .setScrollFactor(0)
      .setDepth(51);

    panel(this, GAME_WIDTH - 150, 10, 140, 56, { radius: 10, alpha: 0.9 }).setScrollFactor(0).setDepth(50);
    this.timerText = makeText(this, GAME_WIDTH - 24, 18, '', 'hud').setOrigin(1, 0).setScrollFactor(0).setDepth(51);
    this.muteBtn = makeText(this, GAME_WIDTH - 24, 44, '', 'small')
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(51)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleMute());
    this.refreshMuteLabel();

    this.flash = makeText(this, GAME_WIDTH / 2, 130, '', 'title', { fontSize: '34px' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(60)
      .setAlpha(0);
  }

  refreshMuteLabel() {
    this.muteBtn.setText(getAudio(this).isMuted() ? '♪ OFF [M]' : '♪ ON [M]');
    this.muteBtn.setColor(getAudio(this).isMuted() ? PALETTE.muted : PALETTE.good);
  }

  toggleMute() {
    getAudio(this).toggleMute();
    this.refreshMuteLabel();
  }

  jump() {
    if (this.ended) return;
    if (this.grinding) {
      this.exitGrind();
      this.player.setVelocityY(GRIND_HOP_V);
      return;
    }
    if (this.player.body.blocked.down || this.player.body.touching.down) {
      this.player.setVelocityY(JUMP_V);
    }
  }

  tryLaunch(zone) {
    if (this.ended || this.grinding) return;
    if (!(this.player.body.blocked.down || this.player.body.touching.down)) return;
    const speed = Math.abs(this.player.body.velocity.x);
    if (speed < 140) return;
    this.player.setVelocityY(RAMP_V);
    this.player.setVelocityX(zone.launchDir * Math.max(320, speed));
    this.showFlash('RAMP!');
  }

  // Clearing a prop: airborne pass over its sensor → one-time bonus.
  tryClear(zone) {
    if (this.ended || zone.cleared) return;
    const grounded = this.player.body.blocked.down || this.player.body.touching.down;
    if (grounded) return; // only counts if you actually jumped/ramped over it
    zone.cleared = true;
    this.score += zone.bonus;
    this.showFlash(`CLEARED +${zone.bonus}`, hexStr(this.band.themeColor));
  }

  tryGrind(zone) {
    if (this.ended || this.grinding) return;
    if (this.grindCooldown > 0) return;
    if (this.player.body.velocity.y < -20) return;
    if (Math.abs(this.player.body.velocity.x) < 70) return;
    this.enterGrind(zone);
  }

  enterGrind(zone) {
    this.grinding = true;
    this.grindRailEnd = zone.railEnd;
    this.player.body.setAllowGravity(false);
    this.player.setVelocityY(0);
    this.player.y = zone.railTop - this.player.body.halfHeight - 2;
    this.multiplier += 1;
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
    if (this.player.body.blocked.down || this.player.body.touching.down) return;
    if (this.trickActive) return;
    this.trickActive = true;
    this.trickStart = this.time.now;
    this.tweens.add({
      targets: this.player,
      angle: this.player.angle + spin,
      duration: TRICK_MS,
      onComplete: () => {
        if (!this.trickActive) return;
        this.trickActive = false;
        this.player.setAngle(0);
        this.combo += 100;
        this.multiplier += 1;
        this.showFlash('+TRICK');
      },
    });
  }

  bail() {
    this.trickActive = false;
    this.player.setAngle(0);
    this.combo = 0;
    this.multiplier = 1;
    this.showFlash('BAIL!', PALETTE.bad);
  }

  bankCombo() {
    if (this.combo <= 0) {
      this.multiplier = 1;
      return;
    }
    const gained = this.combo * this.multiplier;
    this.score += gained;
    this.showFlash(`+${gained}`, hexStr(this.band.themeColor));
    this.combo = 0;
    this.multiplier = 1;
  }

  showFlash(text, color = PALETTE.ink) {
    this.flash.setText(text).setColor(color).setAlpha(1).setScale(1);
    this.tweens.add({ targets: this.flash, alpha: 0, scale: 1.4, duration: 600 });
  }

  endRun() {
    if (this.ended) return;
    this.ended = true;
    this.bankCombo();
    this.registry.set(REG.LAST_SCORE, this.score);
    this.time.delayedCall(380, () => transition(this, 'GameOverScene'));
  }

  update(time, delta) {
    if (this.ended || !this.player) return;
    if (this.grindCooldown > 0) this.grindCooldown -= delta;

    const grounded = this.player.body.blocked.down || this.player.body.touching.down;

    if (this.grinding) {
      this.player.setVelocityY(0);
      if (this.player.body.velocity.x === 0) this.player.setVelocityX(260 * (this.player.flipX ? -1 : 1));
      this.combo += Math.round((delta / 1000) * 60);
      if (this.player.x >= this.grindRailEnd) this.exitGrind();
    } else {
      const accel = grounded ? 1100 : 600;
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

    if (grounded && !this.grinding) {
      if (this.trickActive && time - this.trickStart < TRICK_MS - 40) {
        this.bail();
      } else if (this.airborne) {
        this.bankCombo();
      }
      this.airborne = false;
    } else if (!grounded && !this.grinding) {
      this.airborne = true;
    }

    this.scoreText.setText(`SCORE ${this.score}`);
    this.comboText.setText(this.combo > 0 ? `COMBO ${this.combo}  x${this.multiplier}` : 'chain tricks for combos');
    this.timerText.setText(`${Math.max(0, this.timeLeft)}s`);
  }
}
