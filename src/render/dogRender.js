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

  // Silueta del cuerpo SENTADO como una sola forma (torso + patas delanteras con un
  // hueco entre ellas), en vez de un óvalo con círculos pegados encima — así se lee
  // como un perro de verdad y las patas nunca quedan tapadas por el propio cuerpo.
  const BODY_POINTS = [
    { x: 100, y: 150 },
    { x: 122, y: 152 },
    { x: 142, y: 160 },
    { x: 153, y: 175 },
    { x: 157, y: 195 },
    { x: 154, y: 208 },
    { x: 151, y: 218 },
    { x: 155, y: 230 },
    { x: 153, y: 242 },
    { x: 144, y: 253 },
    { x: 130, y: 259 },
    { x: 118, y: 259 },
    { x: 108, y: 253 },
    { x: 103, y: 242 },
    { x: 100, y: 230 },
    { x: 97, y: 242 },
    { x: 92, y: 253 },
    { x: 82, y: 259 },
    { x: 70, y: 259 },
    { x: 56, y: 253 },
    { x: 47, y: 242 },
    { x: 49, y: 230 },
    { x: 45, y: 218 },
    { x: 46, y: 208 },
    { x: 43, y: 195 },
    { x: 47, y: 175 },
    { x: 58, y: 160 },
    { x: 78, y: 152 },
  ];

  function bodySilhouette(g, color) {
    setColor(g, color);
    g.fillPoints(BODY_POINTS, true);
  }

  // La ropa solo cubre el torso (hasta justo antes de la muesca de las patas), para que
  // las patas siempre se vean con su color de pelaje natural por debajo de la prenda.
  const TORSO_POINTS = [
    { x: 100, y: 150 },
    { x: 122, y: 152 },
    { x: 142, y: 160 },
    { x: 153, y: 175 },
    { x: 157, y: 195 },
    { x: 153, y: 210 },
    { x: 144, y: 222 },
    { x: 100, y: 226 },
    { x: 56, y: 222 },
    { x: 47, y: 210 },
    { x: 43, y: 195 },
    { x: 47, y: 175 },
    { x: 58, y: 160 },
    { x: 78, y: 152 },
  ];

  function torsoFit(g, color) {
    setColor(g, color);
    g.fillPoints(TORSO_POINTS, true);
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
  }

  // --- Ropa: cubre solo el torso (ver torsoFit) para que las patas queden a la vista ---
  const CLOTHING = {
    sudadera: {
      name: 'Sudadera azul',
      draw(g) {
        torsoFit(g, 0x3498db);
        setColor(g, 0x2874a6);
        g.fillEllipse(100, 162, 70, 20);
        g.fillRoundedRect(85, 200, 30, 14, 6);
      },
    },
    rayas: {
      name: 'Camiseta a rayas',
      draw(g) {
        torsoFit(g, 0xecf0f1);
        setColor(g, 0xe74c3c);
        g.fillEllipse(100, 178, 128, 12);
        g.fillEllipse(100, 196, 132, 12);
        g.fillEllipse(100, 214, 122, 12);
      },
    },
    chaqueta: {
      name: 'Chaqueta verde',
      draw(g) {
        torsoFit(g, 0x27ae60);
        setColor(g, 0x1e8449);
        g.fillEllipse(100, 162, 70, 20);
        g.fillRect(97, 172, 6, 50);
        setColor(g, 0xf1c40f);
        g.fillCircle(100, 186, 4);
        g.fillCircle(100, 202, 4);
        g.fillCircle(100, 218, 4);
      },
    },
    vestido: {
      name: 'Vestido rosa',
      draw(g) {
        setColor(g, 0xf78fb3);
        g.fillEllipse(100, 222, 150, 36);
        torsoFit(g, 0xf78fb3);
        setColor(g, 0xffffff);
        g.fillEllipse(100, 162, 20, 12);
      },
    },
    chaleco: {
      name: 'Chaleco a cuadros',
      draw(g) {
        torsoFit(g, 0xf5eee6);
        setColor(g, 0x8d6748);
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            if ((row + col) % 2 === 0) {
              g.fillRect(78 + col * 16, 184 + row * 17, 14, 14);
            }
          }
        }
      },
    },
    camiseta: {
      name: 'Camiseta amarilla',
      draw(g) {
        torsoFit(g, 0xf4d03f);
        setColor(g, 0xd4ac0d);
        g.fillEllipse(100, 162, 66, 18);
      },
    },
    peto: {
      name: 'Peto vaquero',
      draw(g) {
        torsoFit(g, 0xecf0f1);
        setColor(g, 0x4a69bd);
        g.fillRoundedRect(78, 168, 44, 52, 8);
        g.fillRoundedRect(72, 155, 10, 20, 4);
        g.fillRoundedRect(118, 155, 10, 20, 4);
        setColor(g, 0xf4d03f);
        g.fillCircle(100, 180, 3.5);
      },
    },
    poncho: {
      name: 'Poncho arcoíris',
      draw(g) {
        torsoFit(g, 0xecf0f1);
        const colors = [0xe74c3c, 0xf39c12, 0xf1c40f, 0x27ae60, 0x3498db, 0x8e44ad];
        colors.forEach((c, i) => {
          setColor(g, c);
          g.fillEllipse(100, 166 + i * 10, 132 - i * 6, 10);
        });
      },
    },
    abrigo: {
      name: 'Abrigo de invierno',
      draw(g) {
        torsoFit(g, 0xf5f5f5);
        setColor(g, 0xd6dbdf);
        g.fillRect(97, 168, 6, 54);
        g.fillRect(62, 188, 80, 6);
        g.fillRect(62, 208, 80, 6);
        setColor(g, 0xffffff);
        [66, 82, 100, 118, 134].forEach((x) => g.fillCircle(x, 163, 8));
      },
    },
    futbol: {
      name: 'Camiseta de fútbol',
      draw(g) {
        torsoFit(g, 0xffffff);
        setColor(g, 0xe74c3c);
        g.fillEllipse(100, 162, 70, 18);
        g.fillRect(94, 175, 12, 45);
        setColor(g, 0x2c3e50);
        g.fillCircle(100, 198, 8);
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
    corona: {
      name: 'Corona',
      draw(g) {
        setColor(g, 0xf1c40f);
        g.fillPoints(
          [
            { x: 58, y: 78 }, { x: 62, y: 46 }, { x: 78, y: 64 },
            { x: 100, y: 40 }, { x: 122, y: 64 }, { x: 138, y: 46 },
            { x: 142, y: 78 },
          ],
          true
        );
        setColor(g, 0xe74c3c);
        g.fillCircle(100, 52, 5);
        setColor(g, 0x3498db);
        g.fillCircle(78, 62, 4);
        g.fillCircle(122, 62, 4);
      },
    },
    gafas: {
      name: 'Gafas de sol',
      draw(g) {
        setColor(g, 0x2c3e50);
        g.fillRoundedRect(62, 80, 32, 20, 8);
        g.fillRoundedRect(106, 80, 32, 20, 8);
        g.fillRect(94, 87, 12, 5);
      },
    },
    conejo: {
      name: 'Orejas de conejo',
      draw(g) {
        setColor(g, 0xffffff);
        g.fillEllipse(78, 40, 22, 62);
        g.fillEllipse(122, 40, 22, 62);
        setColor(g, 0xf5b7b1);
        g.fillEllipse(78, 44, 10, 42);
        g.fillEllipse(122, 44, 10, 42);
        setColor(g, 0xecf0f1);
        g.fillEllipse(100, 80, 96, 14);
      },
    },
    navidad: {
      name: 'Gorro navideño',
      draw(g) {
        setColor(g, 0xc0392b);
        g.fillPoints(
          [
            { x: 56, y: 82 }, { x: 70, y: 40 }, { x: 130, y: 34 }, { x: 138, y: 44 },
          ],
          true
        );
        setColor(g, 0xffffff);
        g.fillEllipse(60, 82, 96, 16);
        g.fillCircle(136, 42, 9);
      },
    },
    pirata: {
      name: 'Pañuelo pirata',
      draw(g) {
        setColor(g, 0x2c3e50);
        g.fillEllipse(100, 68, 104, 44);
        setColor(g, 0xffffff);
        g.fillCircle(84, 58, 4);
        g.fillCircle(100, 66, 4);
        g.fillCircle(116, 58, 4);
        setColor(g, 0x2c3e50);
        g.fillTriangle(140, 66, 158, 58, 156, 76);
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
    perlas: {
      name: 'Collar de perlas',
      draw(g) {
        setColor(g, 0xfdfefe);
        const pearls = [
          { x: 64, y: 158 }, { x: 78, y: 165 }, { x: 91, y: 170 }, { x: 100, y: 172 },
          { x: 109, y: 170 }, { x: 122, y: 165 }, { x: 136, y: 158 },
        ];
        pearls.forEach((p) => g.fillCircle(p.x, p.y, 5));
      },
    },
    campana: {
      name: 'Collar con campana',
      draw(g) {
        g.lineStyle(8, 0xe74c3c, 1);
        g.strokeEllipse(100, 158, 80, 22);
        setColor(g, 0xf1c40f);
        g.fillCircle(100, 172, 8);
        setColor(g, 0xd4ac0d);
        g.fillRect(97, 172, 6, 4);
      },
    },
    corbata: {
      name: 'Corbata',
      draw(g) {
        g.lineStyle(6, 0x2c3e50, 1);
        g.strokeEllipse(100, 156, 80, 20);
        setColor(g, 0xc0392b);
        g.fillTriangle(92, 162, 108, 162, 100, 176);
        g.fillTriangle(94, 176, 106, 176, 100, 210);
      },
    },
    estrellas: {
      name: 'Collar de estrellas',
      draw(g) {
        g.lineStyle(5, 0x2980b9, 1);
        g.strokeEllipse(100, 158, 80, 22);
        setColor(g, 0xf1c40f);
        [68, 88, 112, 132].forEach((x) => {
          const y = x === 88 || x === 112 ? 170 : 165;
          g.fillCircle(x, y, 5);
        });
      },
    },
    arcoiris: {
      name: 'Collar arcoíris',
      draw(g) {
        const colors = [0xe74c3c, 0xf39c12, 0xf1c40f, 0x27ae60, 0x3498db];
        colors.forEach((c, i) => {
          g.lineStyle(4, c, 1);
          g.strokeEllipse(100, 152 + i * 4, 80 - i * 4, 20);
        });
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
    cama: {
      name: 'Cama de perro',
      draw(g) {
        setColor(g, 0xa9cce3);
        g.fillEllipse(100, 244, 178, 44);
        g.lineStyle(10, 0x5dade2, 1);
        g.strokeEllipse(100, 240, 166, 34);
      },
    },
    tronco: {
      name: 'Tronco',
      draw(g) {
        setColor(g, 0x8b5a2b);
        g.fillRoundedRect(24, 210, 152, 50, 14);
        g.lineStyle(3, 0x6b4423, 1);
        g.strokeEllipse(48, 235, 30, 46);
        g.strokeEllipse(100, 235, 20, 46);
        g.strokeEllipse(150, 235, 26, 46);
      },
    },
    nube: {
      name: 'Nube',
      draw(g) {
        setColor(g, 0xffffff);
        g.fillCircle(60, 236, 26);
        g.fillCircle(90, 222, 30);
        g.fillCircle(124, 222, 30);
        g.fillCircle(150, 236, 26);
        g.fillRect(50, 236, 110, 22);
      },
    },
    hierba: {
      name: 'Parche de hierba',
      draw(g) {
        setColor(g, 0x58d68d);
        g.fillRoundedRect(14, 226, 172, 34, 8);
        setColor(g, 0x2ecc71);
        for (let x = 22; x <= 178; x += 12) {
          g.fillTriangle(x - 6, 226, x + 6, 226, x, 206);
        }
      },
    },
    circo: {
      name: 'Alfombra de circo',
      draw(g) {
        const colors = [0xe74c3c, 0xf1c40f, 0xe74c3c, 0xf1c40f];
        const sizes = [182, 140, 98, 56];
        colors.forEach((c, i) => {
          setColor(g, c);
          g.fillEllipse(100, 248, sizes[i], sizes[i] * 0.22);
        });
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
