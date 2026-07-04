// Genera todas las texturas de pixel art una única vez y arranca el menú.
window.Nonogram = window.Nonogram || {};

Nonogram.Scenes = Nonogram.Scenes || {};

Nonogram.Scenes.BootScene = class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    Nonogram.Render.buildTextures(this);
    this.scene.start('MenuScene');
  }
};
