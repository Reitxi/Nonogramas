// Configuración de Phaser y arranque del juego.
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 680,
  backgroundColor: '#1e1e2e',
  pixelArt: true,
  render: {
    antialias: false,
    roundPixels: true,
  },
  scene: [
    Nonogram.Scenes.BootScene,
    Nonogram.Scenes.MenuScene,
    Nonogram.Scenes.CustomizeScene,
    Nonogram.Scenes.NonogramScene,
  ],
};

new Phaser.Game(config);
