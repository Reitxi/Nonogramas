// Definición de puzzles de nonograma.
// Cada puzzle es una matriz de 0s y 1s. 1 = celda rellena.
const PUZZLES = [
  {
    name: 'Corazón',
    grid: [
      [0, 1, 1, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
    ],
  },
  {
    name: 'Casa',
    grid: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
    ],
  },
  {
    name: 'Barco',
    grid: [
      [0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 0, 0, 0],
    ],
  },
];

// Genera las pistas (clues) de fila/columna a partir de la grid.
function getRowClues(grid) {
  return grid.map((row) => runsOf(row));
}

function getColClues(grid) {
  const cols = grid[0].length;
  const colClues = [];
  for (let c = 0; c < cols; c++) {
    const col = grid.map((row) => row[c]);
    colClues.push(runsOf(col));
  }
  return colClues;
}

function runsOf(line) {
  const runs = [];
  let count = 0;
  for (const cell of line) {
    if (cell === 1) {
      count++;
    } else if (count > 0) {
      runs.push(count);
      count = 0;
    }
  }
  if (count > 0) runs.push(count);
  return runs.length ? runs : [0];
}
