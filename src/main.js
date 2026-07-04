// Juego de Nonogramas (picross) con Phaser 3.
const CELL_SIZE = 40;
const CLUE_AREA = 120;

class NonogramScene extends Phaser.Scene {
  constructor() {
    super('NonogramScene');
    this.puzzleIndex = 0;
  }

  init(data) {
    this.puzzleIndex = data.puzzleIndex || 0;
  }

  create() {
    const puzzle = PUZZLES[this.puzzleIndex];
    this.grid = puzzle.grid;
    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
    this.rowClues = getRowClues(this.grid);
    this.colClues = getColClues(this.grid);

    // Estado del jugador: 0 = vacío, 1 = relleno, 2 = marcado con X
    this.state = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));

    this.boardOriginX = CLUE_AREA;
    this.boardOriginY = CLUE_AREA;

    this.add.text(20, 20, puzzle.name, { fontSize: '24px', color: '#ffffff' });

    this.cellsGfx = [];
    this.drawGridLines();
    this.drawClues();
    this.createCells();

    this.winText = this.add.text(
      this.boardOriginX + (this.cols * CELL_SIZE) / 2,
      this.boardOriginY + this.rows * CELL_SIZE + 40,
      '',
      { fontSize: '28px', color: '#00ff88' }
    ).setOrigin(0.5, 0);

    if (this.puzzleIndex < PUZZLES.length - 1) {
      const nextBtn = this.add.text(
        this.boardOriginX,
        this.boardOriginY + this.rows * CELL_SIZE + 90,
        'Siguiente puzzle >',
        { fontSize: '20px', color: '#ffcc00' }
      ).setInteractive({ useHandCursor: true });
      nextBtn.on('pointerdown', () => {
        this.scene.restart({ puzzleIndex: this.puzzleIndex + 1 });
      });
      nextBtn.setVisible(false);
      this.nextBtn = nextBtn;
    }
  }

  drawGridLines() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x555555, 1);
    for (let r = 0; r <= this.rows; r++) {
      const lw = r % 5 === 0 ? 3 : 1;
      g.lineStyle(lw, 0x888888, 1);
      g.lineBetween(
        this.boardOriginX,
        this.boardOriginY + r * CELL_SIZE,
        this.boardOriginX + this.cols * CELL_SIZE,
        this.boardOriginY + r * CELL_SIZE
      );
    }
    for (let c = 0; c <= this.cols; c++) {
      const lw = c % 5 === 0 ? 3 : 1;
      g.lineStyle(lw, 0x888888, 1);
      g.lineBetween(
        this.boardOriginX + c * CELL_SIZE,
        this.boardOriginY,
        this.boardOriginX + c * CELL_SIZE,
        this.boardOriginY + this.rows * CELL_SIZE
      );
    }
  }

  drawClues() {
    this.rowClues.forEach((clue, r) => {
      const text = clue.join(' ');
      this.add.text(
        this.boardOriginX - 15,
        this.boardOriginY + r * CELL_SIZE + CELL_SIZE / 2,
        text,
        { fontSize: '16px', color: '#ffffff' }
      ).setOrigin(1, 0.5);
    });

    this.colClues.forEach((clue, c) => {
      const text = clue.join('\n');
      this.add.text(
        this.boardOriginX + c * CELL_SIZE + CELL_SIZE / 2,
        this.boardOriginY - 15,
        text,
        { fontSize: '16px', color: '#ffffff', align: 'center' }
      ).setOrigin(0.5, 1);
    });
  }

  createCells() {
    for (let r = 0; r < this.rows; r++) {
      this.cellsGfx[r] = [];
      for (let c = 0; c < this.cols; c++) {
        const x = this.boardOriginX + c * CELL_SIZE;
        const y = this.boardOriginY + r * CELL_SIZE;
        const rect = this.add.rectangle(
          x + CELL_SIZE / 2,
          y + CELL_SIZE / 2,
          CELL_SIZE - 2,
          CELL_SIZE - 2,
          0x2b2b3d
        ).setInteractive({ useHandCursor: true });

        const markText = this.add.text(x + CELL_SIZE / 2, y + CELL_SIZE / 2, '', {
          fontSize: '20px',
          color: '#ff5555',
        }).setOrigin(0.5);

        rect.on('pointerdown', (pointer) => {
          if (pointer.rightButtonDown()) {
            this.toggleMark(r, c, rect, markText);
          } else {
            this.toggleFill(r, c, rect, markText);
          }
        });

        rect.on('pointercontextmenu' in rect ? 'pointercontextmenu' : 'pointerdown', () => {});

        this.cellsGfx[r][c] = { rect, markText };
      }
    }

    // Deshabilita el menú contextual del navegador sobre el canvas para permitir click derecho = marcar.
    this.input.mouse.disableContextMenu();
  }

  toggleFill(r, c, rect, markText) {
    if (this.state[r][c] === 1) {
      this.state[r][c] = 0;
      rect.setFillStyle(0x2b2b3d);
    } else {
      this.state[r][c] = 1;
      markText.setText('');
      rect.setFillStyle(0xffffff);
    }
    this.checkWin();
  }

  toggleMark(r, c, rect, markText) {
    if (this.state[r][c] === 2) {
      this.state[r][c] = 0;
      markText.setText('');
    } else {
      this.state[r][c] = 2;
      rect.setFillStyle(0x2b2b3d);
      markText.setText('X');
    }
  }

  checkWin() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const filled = this.state[r][c] === 1 ? 1 : 0;
        if (filled !== this.grid[r][c]) return;
      }
    }
    this.winText.setText('¡Completado!');
    if (this.nextBtn) this.nextBtn.setVisible(true);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 700,
  height: 650,
  backgroundColor: '#1e1e2e',
  scene: [NonogramScene],
};

new Phaser.Game(config);
