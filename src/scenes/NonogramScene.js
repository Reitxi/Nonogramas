// Nonograma a color: paleta de colores, pistas en círculos de color con estado y marcado con X.
window.Nonogram = window.Nonogram || {};

Nonogram.Scenes = Nonogram.Scenes || {};

const NONOGRAM_MIN_CLUE_AREA = 100;
const NONOGRAM_MAX_BOARD_PX = 350;
const NONOGRAM_MIN_CELL = 22;
const NONOGRAM_MAX_CELL = 40;

Nonogram.Scenes.NonogramScene = class NonogramScene extends Phaser.Scene {
  constructor() {
    super('NonogramScene');
  }

  init(data) {
    this.puzzleId = data.puzzleId || Nonogram.Puzzles[0].id;
  }

  create() {
    const bgColor = Nonogram.Customization.getBackgroundColor(Nonogram.State.getBackground());
    this.cameras.main.setBackgroundColor(bgColor);

    this.puzzle = Nonogram.Puzzles.find((p) => p.id === this.puzzleId) || Nonogram.Puzzles[0];
    this.grid = this.puzzle.grid;
    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
    this.rowClues = Nonogram.Clues.getRowClues(this.grid);
    this.colClues = Nonogram.Clues.getColClues(this.grid);

    this.cellSize = Phaser.Math.Clamp(
      Math.floor(NONOGRAM_MAX_BOARD_PX / Math.max(this.rows, this.cols)),
      NONOGRAM_MIN_CELL,
      NONOGRAM_MAX_CELL
    );

    // 0 = vacío, -1 = marcado con X, 1..N = color pintado.
    this.playerGrid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));

    this.colorKeys = Object.keys(this.puzzle.palette).map(Number);
    this.activeColor = this.colorKeys[0];

    // Cada pista se dibuja como un círculo de color con el número dentro, para que resalte
    // y se distinga bien aunque haya varias apiladas. El área de pistas se calcula a partir
    // de cuántas hacen falta realmente, así la cuadrícula "baja" lo necesario y nunca se salen.
    this.clueRadius = this.cellSize < 30 ? 11 : 13;
    this.clueFontSize = this.cellSize < 30 ? '13px' : '15px';
    this.rowSlot = this.clueRadius * 2 + 6;
    this.colSlot = this.clueRadius * 2 + 4;
    const maxRowClueCount = Math.max(...this.rowClues.map((c) => c.length));
    const maxColClueCount = Math.max(...this.colClues.map((c) => c.length));
    const clueArea = Math.max(
      NONOGRAM_MIN_CLUE_AREA,
      maxRowClueCount * this.rowSlot + 30,
      maxColClueCount * this.colSlot + 30
    );

    this.boardOriginX = clueArea;
    this.boardOriginY = clueArea;

    const backBtn = this.add
      .text(20, 20, '< Menú', { fontSize: '18px', color: '#2c3e50', backgroundColor: '#ffffffcc', padding: { x: 8, y: 4 } })
      .setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.add.text(150, 20, this.puzzle.name, { fontSize: '24px', color: '#2c3e50', fontStyle: 'bold' });

    this.rowClueTexts = [];
    this.colClueTexts = [];
    this.cellRects = [];
    this.cellMarks = [];

    this.drawGridLines();
    this.drawClues();
    this.createCells();
    this.drawPalette();

    const gridRightEdge = this.boardOriginX + this.cols * this.cellSize + 20;
    const panelW = Math.max(gridRightEdge, this.paletteRightEdge + 20) - 10;
    const panelH = this.paletteBottom - 90 + 15;
    this.add.rectangle(10, 90, panelW, panelH, 0xffffff, 0.85).setOrigin(0, 0).setDepth(-1);

    const captionY = this.paletteBottom + 25;
    this.winText = this.add
      .text(this.boardOriginX + (this.cols * this.cellSize) / 2, captionY, '', {
        fontSize: '26px',
        color: '#27ae60',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    const puzzleIndex = Nonogram.Puzzles.findIndex((p) => p.id === this.puzzle.id);
    if (puzzleIndex < Nonogram.Puzzles.length - 1) {
      const nextBtn = this.add
        .text(this.boardOriginX, captionY + 40, 'Siguiente puzzle >', {
          fontSize: '18px',
          color: '#2c3e50',
          backgroundColor: '#ffffffcc',
          padding: { x: 8, y: 4 },
        })
        .setInteractive({ useHandCursor: true });
      nextBtn.on('pointerdown', () => {
        this.scene.start('NonogramScene', { puzzleId: Nonogram.Puzzles[puzzleIndex + 1].id });
      });
      nextBtn.setVisible(false);
      this.nextBtn = nextBtn;
    }

    this.input.mouse.disableContextMenu();
  }

  drawGridLines() {
    const g = this.add.graphics();
    for (let r = 0; r <= this.rows; r++) {
      g.lineStyle(r % 5 === 0 ? 3 : 1, 0x888888, 1);
      g.lineBetween(
        this.boardOriginX,
        this.boardOriginY + r * this.cellSize,
        this.boardOriginX + this.cols * this.cellSize,
        this.boardOriginY + r * this.cellSize
      );
    }
    for (let c = 0; c <= this.cols; c++) {
      g.lineStyle(c % 5 === 0 ? 3 : 1, 0x888888, 1);
      g.lineBetween(
        this.boardOriginX + c * this.cellSize,
        this.boardOriginY,
        this.boardOriginX + c * this.cellSize,
        this.boardOriginY + this.rows * this.cellSize
      );
    }
  }

  // Círculo de color + número encima, con el texto en blanco o oscuro según el contraste.
  makeClueBadge(x, y, clue) {
    const colorHex = this.clueBaseColor(clue);
    const colorNum = Phaser.Display.Color.HexStringToColor(colorHex).color;
    const circle = this.add.circle(x, y, this.clueRadius, colorNum);
    const text = this.add
      .text(x, y, String(clue.count), { fontSize: this.clueFontSize, color: this.contrastColor(colorHex), fontStyle: 'bold' })
      .setOrigin(0.5);
    return { circle, text };
  }

  contrastColor(hex) {
    const c = Phaser.Display.Color.HexStringToColor(hex);
    const luminance = (0.299 * c.red + 0.587 * c.green + 0.114 * c.blue) / 255;
    return luminance > 0.6 ? '#1b2631' : '#ffffff';
  }

  drawClues() {
    for (let r = 0; r < this.rows; r++) {
      const clueArr = this.rowClues[r];
      const y = this.boardOriginY + r * this.cellSize + this.cellSize / 2;
      const baseX = this.boardOriginX - 15 - this.clueRadius;
      const badges = clueArr.map((clue, i) => {
        const x = baseX - (clueArr.length - 1 - i) * this.rowSlot;
        return this.makeClueBadge(x, y, clue);
      });
      this.rowClueTexts.push(badges);
    }

    for (let c = 0; c < this.cols; c++) {
      const clueArr = this.colClues[c];
      const x = this.boardOriginX + c * this.cellSize + this.cellSize / 2;
      const baseY = this.boardOriginY - 15 - this.clueRadius;
      const badges = clueArr.map((clue, i) => {
        const y = baseY - (clueArr.length - 1 - i) * this.colSlot;
        return this.makeClueBadge(x, y, clue);
      });
      this.colClueTexts.push(badges);
    }
  }

  clueBaseColor(clue) {
    return clue.count === 0 ? '#95a5a6' : this.puzzle.palette[clue.color];
  }

  createCells() {
    for (let r = 0; r < this.rows; r++) {
      this.cellRects[r] = [];
      this.cellMarks[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const x = this.boardOriginX + c * this.cellSize;
        const y = this.boardOriginY + r * this.cellSize;
        const rect = this.add
          .rectangle(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize - 2, this.cellSize - 2, 0x2b2b3d)
          .setInteractive({ useHandCursor: true });

        const markText = this.add
          .text(x + this.cellSize / 2, y + this.cellSize / 2, '', { fontSize: '18px', color: '#ff5555' })
          .setOrigin(0.5);

        rect.on('pointerdown', (pointer) => {
          if (pointer.rightButtonDown()) {
            this.toggleMark(r, c);
          } else {
            this.toggleFill(r, c);
          }
        });

        this.cellRects[r][c] = rect;
        this.cellMarks[r][c] = markText;
      }
    }
  }

  drawPalette() {
    const gridBottom = this.boardOriginY + this.rows * this.cellSize;
    const centerY = gridBottom + 55;
    const radius = 18;
    const ringRadius = radius + 7;
    const activeRingRadius = radius + 11;
    const spacing = ringRadius * 2 + 14;

    this.paletteCircles = {};
    this.paletteRings = {};

    this.colorKeys.forEach((colorIndex, i) => {
      const cx = this.boardOriginX + ringRadius + i * spacing;
      const cy = centerY;
      const colorHex = Phaser.Display.Color.HexStringToColor(this.puzzle.palette[colorIndex]).color;

      this.add.circle(cx, cy, ringRadius, 0xffffff).setStrokeStyle(2, 0xcccccc);
      const swatch = this.add.circle(cx, cy, radius, colorHex).setInteractive({ useHandCursor: true });
      const activeRing = this.add.circle(cx, cy, activeRingRadius, 0xffffff, 0).setStrokeStyle(4, 0xf1c40f).setVisible(false);

      swatch.on('pointerdown', () => {
        this.activeColor = colorIndex;
        this.refreshPaletteHighlight();
      });

      this.paletteCircles[colorIndex] = swatch;
      this.paletteRings[colorIndex] = activeRing;
    });

    this.refreshPaletteHighlight();
    this.paletteBottom = centerY + activeRingRadius + 10;
    const lastCx = this.boardOriginX + ringRadius + (this.colorKeys.length - 1) * spacing;
    this.paletteRightEdge = lastCx + ringRadius;
  }

  refreshPaletteHighlight() {
    this.colorKeys.forEach((colorIndex) => {
      this.paletteRings[colorIndex].setVisible(colorIndex === this.activeColor);
    });
  }

  toggleFill(r, c) {
    const rect = this.cellRects[r][c];
    const markText = this.cellMarks[r][c];
    if (this.playerGrid[r][c] === this.activeColor) {
      this.playerGrid[r][c] = 0;
      rect.setFillStyle(0x2b2b3d);
    } else {
      this.playerGrid[r][c] = this.activeColor;
      markText.setText('');
      rect.setFillStyle(Phaser.Display.Color.HexStringToColor(this.puzzle.palette[this.activeColor]).color);
    }
    this.afterCellChange(r, c);
  }

  toggleMark(r, c) {
    const rect = this.cellRects[r][c];
    const markText = this.cellMarks[r][c];
    if (this.playerGrid[r][c] === -1) {
      this.playerGrid[r][c] = 0;
      markText.setText('');
    } else {
      this.playerGrid[r][c] = -1;
      rect.setFillStyle(0x2b2b3d);
      markText.setText('X');
    }
    this.afterCellChange(r, c);
  }

  afterCellChange(r, c) {
    this.updateLineClueStatus(this.rowClues[r], this.rowClueTexts[r], this.playerGrid[r]);
    const colPlayerLine = Nonogram.Clues.getColumn(this.playerGrid, c);
    this.updateLineClueStatus(this.colClues[c], this.colClueTexts[c], colPlayerLine);
    this.checkWin();
  }

  setClueBadgeColor(badge, colorHex) {
    badge.circle.setFillStyle(Phaser.Display.Color.HexStringToColor(colorHex).color);
    badge.text.setColor(this.contrastColor(colorHex));
  }

  updateLineClueStatus(lineClues, badges, playerLine) {
    if (lineClues.length === 1 && lineClues[0].count === 0) {
      const hasPaint = playerLine.some((v) => v > 0);
      this.setClueBadgeColor(badges[0], hasPaint ? '#e74c3c' : '#95a5a6');
      return;
    }
    const statuses = Nonogram.Clues.lineClueStatus(playerLine, lineClues);
    statuses.forEach((status, i) => {
      const clue = lineClues[i];
      let color = this.puzzle.palette[clue.color];
      if (status === 'satisfecha') color = '#95a5a6';
      if (status === 'excedida') color = '#e74c3c';
      this.setClueBadgeColor(badges[i], color);
    });
  }

  checkWin() {
    if (!Nonogram.Clues.checkWin(this.playerGrid, this.grid)) return;
    this.winText.setText('¡Completado!');
    Nonogram.State.markPuzzleCompleted(this.puzzle.id, Nonogram.Puzzles.map((p) => p.id));
    if (this.nextBtn) this.nextBtn.setVisible(true);
  }
};
