// Pantalla de inicio: selector de puzzles, preview del perro y acceso a personalización.
window.Nonogram = window.Nonogram || {};

Nonogram.Scenes = Nonogram.Scenes || {};

Nonogram.Scenes.MenuScene = class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const bgColor = Nonogram.Customization.getBackgroundColor(Nonogram.State.getBackground());
    this.cameras.main.setBackgroundColor(bgColor);

    this.add.text(30, 20, 'Nonogramas', { fontSize: '32px', color: '#2c3e50', fontStyle: 'bold' });

    const equipped = Nonogram.State.getEquipped();
    Nonogram.Render.buildDogContainer(this, 650, 15, equipped).setScale(0.55);

    const customizeBtn = this.add
      .text(650, 170, 'Personalizar >', {
        fontSize: '18px',
        color: '#2c3e50',
        backgroundColor: '#ffffffcc',
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true });
    customizeBtn.on('pointerdown', () => this.scene.start('CustomizeScene'));

    const validIds = Nonogram.Puzzles.map((p) => p.id);
    const completed = Nonogram.State.getCompletedPuzzles(validIds);

    const cols = 3;
    const cardW = 200;
    const cardH = 150;
    const gap = 15;
    const startX = 30;
    const startY = 220;

    Nonogram.Puzzles.forEach((puzzle, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);

      const card = this.add
        .rectangle(x, y, cardW, cardH, 0xffffff, 0.85)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
      card.on('pointerdown', () => this.scene.start('NonogramScene', { puzzleId: puzzle.id }));

      this.drawThumbnail(puzzle, x + cardW / 2, y + 15);

      this.add
        .text(x + cardW / 2, y + cardH - 25, puzzle.name, { fontSize: '18px', color: '#2c3e50' })
        .setOrigin(0.5);

      if (completed.includes(puzzle.id)) {
        this.add
          .text(x + cardW - 15, y + 10, '✓', { fontSize: '22px', color: '#27ae60', fontStyle: 'bold' })
          .setOrigin(1, 0);
      }
    });
  }

  drawThumbnail(puzzle, centerX, topY) {
    const grid = puzzle.grid;
    const rows = grid.length;
    const cols = grid[0].length;
    const maxDim = 90;
    const cellPx = Math.max(4, Math.floor(maxDim / Math.max(rows, cols)));
    const w = cols * cellPx;
    const originX = centerX - w / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = grid[r][c];
        const color = v ? Phaser.Display.Color.HexStringToColor(puzzle.palette[v]).color : 0xd5d8dc;
        this.add
          .rectangle(originX + c * cellPx, topY + r * cellPx, cellPx - 1, cellPx - 1, color)
          .setOrigin(0, 0);
      }
    }
  }
};
