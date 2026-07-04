// Puzzles de nonograma a color.
// Cada celda de `grid` es 0 (vacío) o un índice de `palette` (1..N) con su color hexadecimal.
// Importante: el fondo debe quedar en 0 (vacío) — pintar un "cielo" o fondo sólido entero
// hace que cada objeto que lo interrumpa genere pistas de más en esa fila/columna.
window.Nonogram = window.Nonogram || {};

Nonogram.Puzzles = (() => {
  const SIZE = 12;

  function blank() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }
  function rect(g, r0, r1, c0, c1, v) {
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) g[r][c] = v;
      }
    }
    return g;
  }
  function dot(g, r, c, v) {
    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) g[r][c] = v;
    return g;
  }

  // --- Corazón detallado (con sombreado y brillo) ---
  const corazon = blank();
  rect(corazon, 1, 1, 2, 3, 1);
  rect(corazon, 1, 1, 8, 9, 1);
  rect(corazon, 2, 2, 1, 4, 1);
  rect(corazon, 2, 2, 7, 10, 1);
  rect(corazon, 3, 4, 0, 11, 1);
  rect(corazon, 5, 5, 1, 10, 1);
  rect(corazon, 6, 6, 1, 10, 2);
  rect(corazon, 7, 7, 2, 9, 2);
  rect(corazon, 8, 8, 3, 8, 2);
  rect(corazon, 9, 9, 4, 7, 2);
  rect(corazon, 10, 10, 5, 6, 2);
  dot(corazon, 2, 2, 3);
  dot(corazon, 2, 3, 3);
  dot(corazon, 3, 2, 3);

  // --- Casa de campo (sol, tejado, pared, puerta, ventana, árbol, césped) ---
  const casa = blank();
  rect(casa, 0, 1, 9, 10, 2);
  rect(casa, 4, 4, 3, 5, 3);
  rect(casa, 5, 5, 2, 6, 3);
  rect(casa, 6, 6, 1, 7, 3);
  rect(casa, 7, 9, 1, 7, 4);
  dot(casa, 7, 3, 2);
  rect(casa, 9, 9, 4, 4, 6);
  rect(casa, 5, 7, 9, 11, 5);
  rect(casa, 8, 9, 10, 10, 6);
  rect(casa, 10, 11, 0, 11, 5);

  // --- Barco en el mar (sol, vela, casco, mar) ---
  const barco = blank();
  rect(barco, 0, 1, 1, 2, 2);
  dot(barco, 1, 6, 6);
  rect(barco, 2, 2, 6, 6, 3);
  rect(barco, 3, 3, 5, 7, 3);
  rect(barco, 4, 4, 4, 8, 3);
  rect(barco, 5, 5, 3, 9, 3);
  rect(barco, 6, 6, 5, 7, 4);
  rect(barco, 7, 8, 2, 9, 4);
  rect(barco, 9, 11, 0, 11, 5);

  // --- Gato durmiendo en un cojín ---
  const gato = blank();
  rect(gato, 8, 11, 1, 10, 4);
  rect(gato, 2, 2, 4, 7, 1);
  rect(gato, 3, 8, 2, 9, 1);
  dot(gato, 2, 3, 1);
  dot(gato, 2, 8, 1);
  dot(gato, 3, 3, 3);
  dot(gato, 3, 8, 3);
  rect(gato, 5, 6, 2, 3, 3);
  dot(gato, 5, 3, 2);
  dot(gato, 4, 6, 2);
  dot(gato, 5, 7, 2);
  rect(gato, 6, 7, 8, 9, 1);
  rect(gato, 7, 7, 9, 9, 1);

  // --- Luna y estrellas ---
  const luna = blank();
  rect(luna, 1, 4, 1, 4, 2);
  rect(luna, 2, 3, 2, 3, 0);
  dot(luna, 5, 8, 1);
  rect(luna, 6, 6, 7, 9, 1);
  rect(luna, 7, 7, 6, 10, 1);
  rect(luna, 8, 8, 7, 9, 1);
  dot(luna, 9, 8, 1);
  dot(luna, 2, 9, 1);
  dot(luna, 4, 10, 1);
  dot(luna, 9, 2, 1);
  dot(luna, 10, 5, 1);

  // --- Árbol con manzanas, pájaro y sol ---
  const arbol = blank();
  rect(arbol, 0, 1, 0, 1, 2);
  rect(arbol, 1, 5, 2, 9, 3);
  rect(arbol, 0, 0, 4, 7, 3);
  dot(arbol, 2, 3, 5);
  dot(arbol, 3, 7, 5);
  dot(arbol, 4, 4, 5);
  dot(arbol, 2, 8, 5);
  rect(arbol, 6, 9, 5, 6, 4);
  dot(arbol, 3, 10, 6);
  dot(arbol, 3, 11, 6);
  rect(arbol, 10, 11, 0, 11, 3);

  return [
    { id: 'corazon', name: 'Corazón', palette: { 1: '#e74c3c', 2: '#c0392b', 3: '#f5b7b1' }, grid: corazon },
    {
      id: 'casa',
      name: 'Casa',
      palette: { 2: '#f4d03f', 3: '#c0392b', 4: '#d2b48c', 5: '#27ae60', 6: '#6b3e26' },
      grid: casa,
    },
    {
      id: 'barco',
      name: 'Barco',
      palette: { 2: '#f4d03f', 3: '#ecf0f1', 4: '#5b3a29', 5: '#2980b9', 6: '#e74c3c' },
      grid: barco,
    },
    {
      id: 'gato',
      name: 'Gato',
      palette: { 1: '#95a5a6', 2: '#2c3e50', 3: '#f1c8b0', 4: '#e91e63' },
      grid: gato,
    },
    {
      id: 'estrella',
      name: 'Luna y estrellas',
      palette: { 1: '#f4d03f', 2: '#ecf0f1' },
      grid: luna,
    },
    {
      id: 'arbol',
      name: 'Árbol',
      palette: { 2: '#f4d03f', 3: '#27ae60', 4: '#8b5a2b', 5: '#e74c3c', 6: '#e67e22' },
      grid: arbol,
    },
  ];
})();
