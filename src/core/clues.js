// Lógica pura de nonogramas a color: generación de pistas y estado de progreso.
// Sin dependencias de Phaser para que sea fácil de razonar/testear por separado.
window.Nonogram = window.Nonogram || {};

Nonogram.Clues = (() => {
  // Agrupa runs consecutivos del mismo color (>0) en una línea.
  // Un cambio de color corta el grupo aunque las celdas sean contiguas.
  function computeClues(line) {
    const clues = [];
    let i = 0;
    while (i < line.length) {
      const color = line[i];
      if (!color) {
        i++;
        continue;
      }
      const start = i;
      while (i < line.length && line[i] === color) i++;
      clues.push({ count: i - start, color, start, end: i - 1 });
    }
    return clues.length ? clues : [{ count: 0, color: null, start: -1, end: -1 }];
  }

  function getRowClues(grid) {
    return grid.map((row) => computeClues(row));
  }

  function getColClues(grid) {
    const cols = grid[0].length;
    const colClues = [];
    for (let c = 0; c < cols; c++) {
      colClues.push(computeClues(grid.map((row) => row[c])));
    }
    return colClues;
  }

  // Estado por número de pista, anclado a la solución conocida (no es un solver genérico):
  // 'satisfecha' si ese run exacto está pintado y no se desborda a los lados,
  // 'excedida' si hay desbordamiento o más celdas de ese color en la línea de las que suman las pistas,
  // 'pendiente' en cualquier otro caso.
  function lineClueStatus(playerLine, solutionClues) {
    if (solutionClues.length === 1 && solutionClues[0].count === 0) return [];

    const colorTotals = {};
    solutionClues.forEach((c) => {
      colorTotals[c.color] = (colorTotals[c.color] || 0) + c.count;
    });
    const playerColorCounts = {};
    playerLine.forEach((cell) => {
      if (cell > 0) playerColorCounts[cell] = (playerColorCounts[cell] || 0) + 1;
    });

    return solutionClues.map((clue) => {
      let filled = true;
      for (let j = clue.start; j <= clue.end; j++) {
        if (playerLine[j] !== clue.color) {
          filled = false;
          break;
        }
      }
      const bleedLeft = clue.start > 0 && playerLine[clue.start - 1] === clue.color;
      const bleedRight = clue.end < playerLine.length - 1 && playerLine[clue.end + 1] === clue.color;
      const exceeded = bleedLeft || bleedRight || (playerColorCounts[clue.color] || 0) > colorTotals[clue.color];

      if (filled && !bleedLeft && !bleedRight) return 'satisfecha';
      if (exceeded) return 'excedida';
      return 'pendiente';
    });
  }

  // Compara el estado del jugador (0 vacío, -1 marcado con X, 1..N color) contra la solución.
  function checkWin(playerGrid, solutionGrid) {
    for (let r = 0; r < solutionGrid.length; r++) {
      for (let c = 0; c < solutionGrid[r].length; c++) {
        const painted = playerGrid[r][c] > 0 ? playerGrid[r][c] : 0;
        if (painted !== solutionGrid[r][c]) return false;
      }
    }
    return true;
  }

  function getColumn(grid, c) {
    return grid.map((row) => row[c]);
  }

  return { computeClues, getRowClues, getColClues, lineClueStatus, checkWin, getColumn };
})();
