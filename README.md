# Nonogramas

Un juego de nonogramas (picross) a color, con menú de puzzles y un perro personalizable, al estilo *Hungry Cat Picross*, hecho con [Phaser 3](https://phaser.io/), jugable directamente en el navegador.

## Cómo jugar

- Desde el menú, elige un puzzle de la cuadrícula. Los ya resueltos muestran un ✓.
- En el puzzle, cada fila y columna tiene pistas numéricas coloreadas: cada número indica un grupo de celdas consecutivas del color con el que está pintado.
- Elige un color de los círculos de la paleta (debajo del tablero) y haz clic izquierdo para pintar una celda con ese color; vuelve a hacer clic con el mismo color para vaciarla. El círculo activo se marca con un anillo dorado.
- Clic derecho: marca la celda con una X (para descartar casillas que crees vacías).
- Una pista se atenúa en gris cuando ese grupo está pintado correctamente, y se pone en rojo si te has pasado pintando más celdas de ese color de las que pide esa línea.
- Completa el patrón exacto (colores incluidos) en todas las filas y columnas para ganar el puzzle. Los puzzles son escenas de al menos 12×12 celdas con varios elementos y colores.
- Desde "Personalizar" en el menú puedes cambiar la ropa, el gorro, el collar, el cajón donde se sienta el perro y el color de fondo — 5 opciones en cada categoría. Todo se guarda automáticamente en tu navegador.

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

No hay bundler: todo se carga con `<script>` planos en `index.html`, en un orden estricto (core y render primero —`customization.js` necesita el catálogo de `Nonogram.Render`—, luego el resto de data, las escenas, y `main.js` al final). Todo cuelga de un único namespace global `Nonogram` para evitar colisiones.

El perro y sus accesorios son ilustración vectorial (círculos y elipses dibujados con `Phaser.GameObjects.Graphics`), no pixel art ni imágenes — así el resultado es más suave y realista sin depender de assets externos.

```
.
├── index.html                     # Punto de entrada, orden de carga de scripts y favicon
├── src/
│   ├── core/
│   │   ├── state.js                 # Nonogram.State — progreso y personalización en localStorage
│   │   └── clues.js                  # Nonogram.Clues — pistas a color y su estado (sin Phaser)
│   ├── render/
│   │   └── dogRender.js               # Nonogram.Render — dibuja al perro y accesorios con Graphics
│   ├── data/
│   │   ├── puzzles.js                 # Nonogram.Puzzles — grids de color + paleta por puzzle
│   │   └── customization.js            # Nonogram.Customization — catálogo de items y fondos
│   ├── scenes/
│   │   ├── BootScene.js                  # Arranca el menú
│   │   ├── MenuScene.js                   # Selector de puzzles + acceso a personalización
│   │   ├── CustomizeScene.js               # Personalización del perro y del fondo
│   │   └── NonogramScene.js                # El juego de nonograma a color en sí
│   └── main.js                    # Configuración de Phaser y lista de escenas
```

## Añadir contenido

- **Nuevos puzzles:** edita `src/data/puzzles.js` y añade un objeto con `id`, `name`, `palette` (índice de color → hex) y `grid` (matriz con esos índices, `0` = vacío = fondo, nunca lo rellenes de color entero o dispararás el número de pistas por línea). Se recomienda un mínimo de 12×12 celdas; el tamaño de celda en pantalla se ajusta solo según las dimensiones del puzzle.
- **Nuevas prendas/accesorios:** edita `src/render/dogRender.js` añadiendo una entrada `{ name, draw(g) {...} }` en el catálogo correspondiente (`CLOTHING`, `HEADWEAR`, `COLLAR`, `DRAWER`), dibujando con los métodos de `Phaser.GameObjects.Graphics` (`fillEllipse`, `fillCircle`, `strokeEllipse`, etc.) sobre el mismo lienzo de referencia (200×260, cabeza centrada en 100,100, cuerpo en 100,195). Aparecerá automáticamente en `CustomizeScene` a través de `Nonogram.Customization`.
- **Nuevos fondos:** añade una entrada a `Nonogram.Customization.backgrounds` en `src/data/customization.js`.
