// Perro personalizable como ilustración vectorial (círculos/elipses vía Phaser Graphics),
// inspirado en un perro real: pelaje crema, orejas caídas, ojos oscuros, hocico negro.
window.Nonogram = window.Nonogram || {};

Nonogram.Render = (() => {
  const CANVAS = { width: 200, height: 260 };

  const DOG = {
    furBase: 0xe3c99b,
    furShadow: 0xc9a876,
    furLight: 0xf5ecd9,
    eyeDark: 0x3b2412,
    nose: 0x2b2019,
    tongue: 0xe8899a,
  };

  // Referencia de coordenadas (lienzo 200x260), para que la ropa y los accesorios
  // encajen siempre en el mismo sitio sin tapar ojos ni esconder las patas:
  //   cabeza: centro (100,98) r=48x44 → ocupa y 54-142
  //   ojos:   y=88 → ocupa y 80-96 (los accesorios de cabeza no deben bajar de y=80)
  //   cuerpo: centro (100,205) r=72x52 → ocupa y 153-257
  //   patas:  se dibujan las últimas, para quedar siempre por delante del cuerpo

  function setColor(g, color, alpha) {
    g.fillStyle(color, alpha === undefined ? 1 : alpha);
  }

  // Silueta base del cuerpo, compartida por el perro y por la ropa para que cualquier
  // prenda quede ajustada exactamente sobre el torso en vez de flotar suelta.
  function bodySilhouette(g, color) {
    setColor(g, color);
    g.fillEllipse(100, 205, 144, 104);
  }

  function pawShapes(g, baseColor, shadowColor) {
    setColor(g, shadowColor);
    g.fillEllipse(70, 253, 34, 24);
    g.fillEllipse(130, 253, 34, 24);
    setColor(g, baseColor);
    g.fillEllipse(70, 247, 28, 22);
    g.fillEllipse(130, 247, 28, 22);
  }

  function drawDogBase(g) {
    // cuerpo
    bodySilhouette(g, DOG.furBase);

    // cuello (rellena el hueco entre cabeza y cuerpo)
    setColor(g, DOG.furBase);
    g.fillEllipse(100, 132, 88, 60);

    // orejas caídas (detrás de la cabeza)
    setColor(g, DOG.furShadow);
    g.fillEllipse(56, 110, 32, 76);
    g.fillEllipse(144, 110, 32, 76);

    // cabeza
    setColor(g, DOG.furBase);
    g.fillEllipse(100, 98, 96, 88);

    // hocico
    setColor(g, DOG.furLight);
    g.fillEllipse(100, 120, 54, 42);

    // nariz
    setColor(g, DOG.nose);
    g.fillEllipse(100, 110, 16, 11);

    // lengua
    setColor(g, DOG.tongue);
    g.fillEllipse(100, 134, 14, 18);

    // ojos + brillo
    setColor(g, DOG.eyeDark);
    g.fillEllipse(78, 88, 14, 16);
    g.fillEllipse(122, 88, 14, 16);
    setColor(g, 0xffffff);
    g.fillCircle(81, 84, 3);
    g.fillCircle(125, 84, 3);

    // patas delanteras — se dibujan al final para quedar por delante del cuerpo
    pawShapes(g, DOG.furBase, DOG.furShadow);
  }

  // --- Ropa: siempre redibuja la silueta del cuerpo para que quede ajustada ---
  const CLOTHING = {
    sudadera: {
      name: 'Sudadera azul',
      draw(g) {
        bodySilhouette(g, 0x3498db);
        setColor(g, 0x2874a6);
        g.fillEllipse(100, 162, 70, 20);
        g.fillRoundedRect(85, 208, 30, 16, 6);
        pawShapes(g, DOG.furBase, DOG.furShadow);
      },
    },
    rayas: {
      name: 'Camiseta a rayas',
      draw(g) {
        bodySilhouette(g, 0xecf0f1);
        setColor(g, 0xe74c3c);
        g.fillEllipse(100, 190, 122, 13);
        g.fillEllipse(100, 210, 132, 13);
        g.fillEllipse(100, 230, 116, 13);
        pawShapes(g, DOG.furBase, DOG.furShadow);
      },
    },
    chaqueta: {
      name: 'Chaqueta verde',
      draw(g) {
        bodySilhouette(g, 0x27ae60);
        setColor(g, 0x1e8449);
        g.fillEllipse(100, 162, 70, 20);
        g.fillRect(97, 172, 6, 66);
        setColor(g, 0xf1c40f);
        g.fillCircle(100, 188, 4);
        g.fillCircle(100, 206, 4);
        g.fillCircle(100, 224, 4);
        pawShapes(g, DOG.furBase, DOG.furShadow);
      },
    },
    vestido: {
      name: 'Vestido rosa',
      draw(g) {
        setColor(g, 0xf78fb3);
        g.fillEllipse(100, 236, 164, 52);
        bodySilhouette(g, 0xf78fb3);
        setColor(g, 0xffffff);
        g.fillEllipse(100, 162, 20, 12);
        pawShapes(g, DOG.furBase, DOG.furShadow);
      },
    },
    chaleco: {
      name: 'Chaleco a cuadros',
      draw(g) {
        bodySilhouette(g, 0xf5eee6);
        setColor(g, 0x8d6748);
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            if ((row + col) % 2 === 0) {
              g.fillRect(78 + col * 16, 186 + row * 16, 14, 14);
            }
          }
        }
        pawShapes(g, DOG.furBase, DOG.furShadow);
      },
    },
  };

  // --- Cabeza: los accesorios no deben bajar de y≈80 para no tapar los ojos ---
  const HEADWEAR = {
    gorro: {
      name: 'Gorro de lana',
      draw(g) {
        setColor(g, 0x9b59b6);
        g.fillEllipse(100, 60, 98, 40);
        setColor(g, 0x6c3483);
        g.fillEllipse(100, 78, 100, 14);
        setColor(g, 0xffffff);
        g.fillCircle(100, 36, 7);
      },
    },
    gorra: {
      name: 'Gorra',
      draw(g) {
        setColor(g, 0xe67e22);
        g.fillEllipse(100, 58, 90, 36);
        setColor(g, 0xaf601a);
        g.fillEllipse(100, 78, 66, 10);
      },
    },
    lazo: {
      name: 'Lazo',
      draw(g) {
        setColor(g, 0xe91e63);
        g.fillTriangle(80, 44, 100, 56, 80, 68);
        g.fillTriangle(120, 44, 100, 56, 120, 68);
        setColor(g, 0xad1457);
        g.fillCircle(100, 56, 6);
      },
    },
    diadema: {
      name: 'Diadema con flor',
      draw(g) {
        g.lineStyle(7, 0xffffff, 1);
        g.beginPath();
        g.arc(100, 98, 50, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
        g.strokePath();
        setColor(g, 0xe74c3c);
        g.fillCircle(132, 66, 7);
        g.fillCircle(141, 74, 6);
        g.fillCircle(124, 72, 6);
        setColor(g, 0xf1c40f);
        g.fillCircle(133, 72, 3.5);
      },
    },
    paja: {
      name: 'Sombrero de paja',
      draw(g) {
        setColor(g, 0xe8c170);
        g.fillEllipse(100, 58, 148, 18);
        g.fillEllipse(100, 40, 66, 30);
        setColor(g, 0xc0392b);
        g.fillEllipse(100, 52, 68, 8);
      },
    },
  };

  // --- Collar: banda justo debajo de la barbilla, sobre el pecho ---
  const COLLAR = {
    rojo: {
      name: 'Collar rojo',
      draw(g) {
        g.lineStyle(9, 0xc0392b, 1);
        g.strokeEllipse(100, 158, 80, 22);
        setColor(g, 0xf1c40f);
        g.fillCircle(100, 168, 5);
      },
    },
    pajarita: {
      name: 'Pajarita',
      draw(g) {
        g.lineStyle(5, 0x1b4f72, 1);
        g.strokeEllipse(100, 158, 80, 22);
        setColor(g, 0x2980b9);
        g.fillTriangle(89, 160, 100, 167, 89, 174);
        g.fillTriangle(111, 160, 100, 167, 111, 174);
        setColor(g, 0x1b4f72);
        g.fillCircle(100, 167, 4.5);
      },
    },
    hueso: {
      name: 'Collar con hueso',
      draw(g) {
        g.lineStyle(7, 0x7f8c8d, 1);
        g.strokeEllipse(100, 158, 80, 22);
        setColor(g, 0xecf0f1);
        g.fillRoundedRect(91, 167, 18, 7, 3);
        g.fillCircle(91, 167, 4.5);
        g.fillCircle(91, 174, 4.5);
        g.fillCircle(109, 167, 4.5);
        g.fillCircle(109, 174, 4.5);
      },
    },
    bufanda: {
      name: 'Bufanda',
      draw(g) {
        g.lineStyle(15, 0xe67e22, 1);
        g.strokeEllipse(100, 157, 84, 26);
        setColor(g, 0xaf601a);
        g.fillRoundedRect(94, 172, 13, 22, 5);
      },
    },
    flores: {
      name: 'Collar de flores',
      draw(g) {
        g.lineStyle(5, 0x27ae60, 1);
        g.strokeEllipse(100, 158, 80, 22);
        setColor(g, 0xe91e63);
        [62, 81, 100, 119, 138].forEach((x) => g.fillCircle(x, x === 100 ? 170 : 165, 4.5));
        setColor(g, 0xf1c40f);
        [62, 81, 100, 119, 138].forEach((x) => g.fillCircle(x, x === 100 ? 170 : 165, 2));
      },
    },
  };

  // --- Cajón / asiento: detrás del perro, parte inferior del lienzo ---
  const DRAWER = {
    caja: {
      name: 'Caja de madera',
      draw(g) {
        setColor(g, 0xa1662f);
        g.fillRoundedRect(14, 214, 172, 46, 10);
        setColor(g, 0x7a4a1f);
        g.fillRect(14, 228, 172, 4);
        g.fillRect(14, 244, 172, 4);
      },
    },
    cesta: {
      name: 'Cesta',
      draw(g) {
        setColor(g, 0xd2a679);
        g.fillRoundedRect(14, 214, 172, 46, 20);
        g.lineStyle(3, 0xa67c46, 1);
        for (let y = 220; y <= 252; y += 9) {
          g.beginPath();
          g.moveTo(18, y);
          g.lineTo(182, y);
          g.strokePath();
        }
      },
    },
    cojin: {
      name: 'Cojín',
      draw(g) {
        setColor(g, 0xf39fc0);
        g.fillEllipse(100, 240, 176, 48);
        setColor(g, 0xc2185b);
        g.fillCircle(90, 240, 4);
        g.fillCircle(110, 240, 4);
      },
    },
    manta: {
      name: 'Manta plegada',
      draw(g) {
        setColor(g, 0x5dade2);
        g.fillRoundedRect(14, 214, 172, 46, 10);
        setColor(g, 0x2e86c1);
        g.fillRect(14, 223, 172, 5);
        g.fillRect(14, 238, 172, 5);
        g.fillRect(14, 253, 172, 4);
      },
    },
    alfombra: {
      name: 'Alfombra redonda',
      draw(g) {
        setColor(g, 0x48c9b0);
        g.fillEllipse(100, 248, 182, 36);
        g.lineStyle(4, 0x117864, 1);
        g.strokeEllipse(100, 248, 152, 24);
      },
    },
  };

  const CATALOG = { clothing: CLOTHING, headwear: HEADWEAR, collar: COLLAR, drawer: DRAWER };

  function buildTextures() {
    // Sin texturas que generar: todo se dibuja con Graphics en el momento.
  }

  function drawLayer(g, category, itemId) {
    const group = CATALOG[category];
    const item = group[itemId] || group[Object.keys(group)[0]];
    item.draw(g);
  }

  function buildDogContainer(scene, x, y, equipped) {
    const container = scene.add.container(x, y);
    const layers = {};
    // El cajón va detrás; la ropa y el collar se redibujan con sus propias patas/cuerpo
    // encima del perro base, y el gorro va delante de todo.
    const order = ['drawer', 'dog', 'collar', 'clothing', 'headwear'];
    order.forEach((layer) => {
      const g = scene.add.graphics();
      if (layer === 'dog') {
        drawDogBase(g);
      } else {
        drawLayer(g, layer, equipped[layer]);
      }
      layers[layer] = g;
      container.add(g);
    });
    container.dogLayers = layers;
    return container;
  }

  function updateDogLayer(container, category, itemId) {
    const g = container.dogLayers[category];
    if (!g) return;
    g.clear();
    drawLayer(g, category, itemId);
  }

  return { CANVAS, DOG, CATALOG, buildTextures, buildDogContainer, updateDogLayer };
})();
