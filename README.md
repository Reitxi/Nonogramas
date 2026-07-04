# Nonogramas

Un juego de nonogramas (picross) hecho con [Phaser 3](https://phaser.io/), jugable directamente en el navegador.

## Cómo jugar

- Cada fila y columna tiene pistas numéricas que indican grupos de celdas rellenas consecutivas.
- Clic izquierdo: rellena la celda.
- Clic derecho: marca la celda con una X (para descartar casillas).
- Completa el patrón correcto en todas las filas y columnas para ganar el puzzle.

## Ejecutar en local

No requiere build. Basta con servir la carpeta con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

o

```bash
python3 -m http.server
```

Luego abre `http://localhost:PORT` en el navegador.

## Estructura del proyecto

```
.
├── index.html        # Punto de entrada
├── src/
│   ├── main.js        # Escena principal de Phaser y lógica del juego
│   └── puzzles.js      # Definición de los puzzles y generación de pistas
```

## Añadir nuevos puzzles

Edita `src/puzzles.js` y agrega un nuevo objeto al array `PUZZLES` con un `name` y una `grid` (matriz de 0s y 1s).
