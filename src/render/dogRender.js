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

  // Perfil derecho del torso (x del contorno a cada altura y), para poder acotar
  // cualquier decoración de ropa a un ancho seguro y que nunca sobresalga de la silueta.
  const TORSO_PROFILE = [
    { y: 150, x: 100 },
    { y: 152, x: 122 },
    { y: 160, x: 142 },
    { y: 175, x: 153 },
    { y: 195, x: 157 },
    { y: 210, x: 153 },
    { y: 222, x: 144 },
    { y: 226, x: 100 },
  ];

  function torsoHalfWidth(y) {
    const yy = Phaser.Math.Clamp(y, TORSO_PROFILE[0].y, TORSO_PROFILE[TORSO_PROFILE.length - 1].y);
    for (let i = 0; i < TORSO_PROFILE.length - 1; i++) {
      const a = TORSO_PROFILE[i];
      const b = TORSO_PROFILE[i + 1];
      if (yy >= a.y && yy <= b.y) {
        const t = b.y === a.y ? 0 : (yy - a.y) / (b.y - a.y);
        return a.x + t * (b.x - a.x) - 100;
      }
    }
    return 0;
  }

  // Ancho seguro (con margen) para una decoración centrada en x=100 a una altura y dada,
  // para que nunca sobresalga del contorno real del torso.
  function safeWidth(y, margin) {
    return torsoHalfWidth(y) * 2 * (margin === undefined ? 0.86 : margin);
  }

  function drawHeart(g, cx, cy, r, color) {
    setColor(g, color);
    g.fillCircle(cx - r * 0.5, cy - r * 0.35, r * 0.62);
    g.fillCircle(cx + r * 0.5, cy - r * 0.35, r * 0.62);
    g.fillTriangle(cx - r * 1.05, cy - r * 0.15, cx + r * 1.05, cy - r * 0.15, cx, cy + r * 0.95);
  }

  function drawStar(g, cx, cy, r, color) {
    setColor(g, color);
    const points = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.42;
      points.push({ x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad });
    }
    g.fillPoints(points, true);
  }

  function drawFlower(g, cx, cy, r, petalColor, centerColor) {
    setColor(g, petalColor);
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      g.fillCircle(cx + Math.cos(angle) * r * 0.8, cy + Math.sin(angle) * r * 0.8, r * 0.55);
    }
    setColor(g, centerColor);
    g.fillCircle(cx, cy, r * 0.45);
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

  // --- Ropa: cubre solo el torso (ver torsoFit) para que las patas queden a la vista.
  // Todas las decoraciones usan safeWidth(y) para no sobresalir nunca de la silueta real
  // del torso (que se estrecha arriba y abajo), evitando el bug de "ropa que se sale del cuerpo".
  const CLOTHING = {
    sudadera: {
      name: 'Sudadera rosa kawaii',
      draw(g) {
        torsoFit(g, 0xffc6de);
        setColor(g, 0xff9ec7);
        g.fillEllipse(100, 160, safeWidth(160), 14);
        drawHeart(g, 100, 197, 15, 0xffffff);
        setColor(g, 0xff6fa5);
        g.fillCircle(100, 197, 3);
      },
    },
    rayas: {
      name: 'Camiseta de rayitas pastel',
      draw(g) {
        torsoFit(g, 0xfff8ee);
        setColor(g, 0x9fdfc4);
        [176, 193, 210].forEach((y) => g.fillEllipse(100, y, safeWidth(y), 11));
      },
    },
    chaqueta: {
      name: 'Chaqueta lavanda de flores',
      draw(g) {
        torsoFit(g, 0xd0bdf0);
        setColor(g, 0xb49ddb);
        g.fillEllipse(100, 160, safeWidth(160), 14);
        g.fillRect(97, 168, 6, 50);
        drawFlower(g, 100, 188, 8, 0xffe1ef, 0xf1c40f);
        drawFlower(g, 100, 208, 8, 0xffe1ef, 0xf1c40f);
      },
    },
    vestido: {
      name: 'Vestido de flores',
      draw(g) {
        setColor(g, 0xffb6c9);
        g.fillEllipse(100, 224, 90, 26);
        torsoFit(g, 0xffb6c9);
        setColor(g, 0xffffff);
        g.fillEllipse(100, 162, safeWidth(162) * 0.55, 10);
        drawFlower(g, 80, 190, 7, 0xffffff, 0xf7c9dc);
        drawFlower(g, 120, 190, 7, 0xffffff, 0xf7c9dc);
        drawFlower(g, 100, 210, 7, 0xffffff, 0xf7c9dc);
      },
    },
    chaleco: {
      name: 'Chaleco de corazones',
      draw(g) {
        torsoFit(g, 0xfff3e6);
        setColor(g, 0xf4a7b9);
        g.fillEllipse(100, 160, safeWidth(160), 12);
        drawHeart(g, 84, 190, 8, 0xf4a7b9);
        drawHeart(g, 116, 190, 8, 0xf4a7b9);
        drawHeart(g, 100, 210, 8, 0xf4a7b9);
      },
    },
    camiseta: {
      name: 'Camiseta de estrellitas',
      draw(g) {
        torsoFit(g, 0xfff2a8);
        setColor(g, 0xf7dd6c);
        g.fillEllipse(100, 160, safeWidth(160), 14);
        drawStar(g, 84, 192, 8, 0xffffff);
        drawStar(g, 116, 192, 8, 0xffffff);
        drawStar(g, 100, 212, 9, 0xffffff);
      },
    },
    peto: {
      name: 'Peto con margaritas',
      draw(g) {
        torsoFit(g, 0xf5eee6);
        setColor(g, 0xaecbec);
        g.fillRoundedRect(78, 168, 44, 52, 10);
        g.fillRoundedRect(74, 155, 9, 20, 4);
        g.fillRoundedRect(117, 155, 9, 20, 4);
        drawFlower(g, 100, 182, 7, 0xffffff, 0xf1c40f);
      },
    },
    poncho: {
      name: 'Poncho arcoíris pastel',
      draw(g) {
        torsoFit(g, 0xfff8f0);
        const colors = [0xffb6c9, 0xffd9a0, 0xfff3a0, 0xb8e8c4, 0xaed6f1, 0xd6b8f0];
        const ys = [168, 178, 188, 198, 208, 217];
        colors.forEach((c, i) => {
          setColor(g, c);
          g.fillEllipse(100, ys[i], safeWidth(ys[i]), 11);
        });
      },
    },
    abrigo: {
      name: 'Abrigo de nieve con pompones',
      draw(g) {
        torsoFit(g, 0xfbfcfe);
        setColor(g, 0xdcecf9);
        g.fillRect(97, 168, 6, 54);
        g.fillRect(100 - safeWidth(190) / 2, 190, safeWidth(190), 5);
        g.fillRect(100 - safeWidth(208) / 2, 208, safeWidth(208), 5);
        setColor(g, 0xffffff);
        const pomWidth = safeWidth(163);
        [-0.36, -0.18, 0, 0.18, 0.36].forEach((f) => g.fillCircle(100 + f * pomWidth, 163, 8));
      },
    },
    pijama: {
      name: 'Pijama de nubes',
      draw(g) {
        torsoFit(g, 0xcfe8f7);
        setColor(g, 0xffffff);
        g.fillCircle(82, 186, 9);
        g.fillCircle(94, 182, 11);
        g.fillCircle(108, 184, 10);
        g.fillCircle(96, 208, 8);
        g.fillCircle(108, 210, 10);
        g.fillCircle(120, 206, 8);
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
      name: 'Cajita de regalo',
      draw(g) {
        setColor(g, 0xffd3e8);
        g.fillRoundedRect(14, 214, 172, 46, 12);
        setColor(g, 0xff9ec7);
        g.fillRect(94, 214, 12, 46);
        g.fillRect(14, 231, 172, 10);
        setColor(g, 0xff6fa5);
        g.fillTriangle(78, 204, 100, 216, 78, 224);
        g.fillTriangle(122, 204, 100, 216, 122, 224);
        g.fillCircle(100, 216, 5);
      },
    },
    cesta: {
      name: 'Cestita con corazón',
      draw(g) {
        setColor(g, 0xf3d9b1);
        g.fillRoundedRect(14, 214, 172, 46, 20);
        g.lineStyle(3, 0xd8b98a, 1);
        for (let y = 220; y <= 252; y += 9) {
          g.beginPath();
          g.moveTo(18, y);
          g.lineTo(182, y);
          g.strokePath();
        }
        drawHeart(g, 100, 216, 9, 0xf4a7b9);
      },
    },
    cojin: {
      name: 'Cojín de nube',
      draw(g) {
        setColor(g, 0xeaf6ff);
        g.fillCircle(66, 244, 22);
        g.fillCircle(92, 232, 26);
        g.fillCircle(122, 232, 26);
        g.fillCircle(148, 244, 22);
        g.fillRoundedRect(56, 240, 100, 26, 16);
        setColor(g, 0xbfe3f7);
        g.fillCircle(90, 244, 3);
        g.fillCircle(110, 244, 3);
      },
    },
    manta: {
      name: 'Manta de rayitas pastel',
      draw(g) {
        setColor(g, 0xffe9c7);
        g.fillRoundedRect(14, 214, 172, 46, 12);
        setColor(g, 0xffcf94);
        g.fillRect(14, 223, 172, 5);
        g.fillRect(14, 238, 172, 5);
        g.fillRect(14, 253, 172, 4);
      },
    },
    alfombra: {
      name: 'Alfombra arcoíris pastel',
      draw(g) {
        const colors = [0xffd3e0, 0xffe7c2, 0xfff6b8, 0xc9f0d1, 0xc6e6fb];
        colors.forEach((c, i) => {
          setColor(g, c);
          g.fillEllipse(100, 248, 182 - i * 16, 36 - i * 3);
        });
      },
    },
    cama: {
      name: 'Cama con corazones',
      draw(g) {
        setColor(g, 0xffe1ec);
        g.fillEllipse(100, 244, 178, 44);
        g.lineStyle(9, 0xffb6c9, 1);
        g.strokeEllipse(100, 240, 166, 34);
        drawHeart(g, 100, 240, 9, 0xff9ec7);
      },
    },
    tronco: {
      name: 'Tronco con setas',
      draw(g) {
        setColor(g, 0xc39066);
        g.fillRoundedRect(24, 210, 152, 50, 14);
        g.lineStyle(3, 0x9c6b41, 1);
        g.strokeEllipse(48, 235, 30, 46);
        g.strokeEllipse(100, 235, 20, 46);
        g.strokeEllipse(150, 235, 26, 46);
        setColor(g, 0xffffff);
        g.fillRect(132, 202, 5, 10);
        g.fillRect(150, 200, 5, 12);
        setColor(g, 0xe74c3c);
        g.fillCircle(134, 198, 8);
        g.fillCircle(152, 196, 9);
        setColor(g, 0xffffff);
        g.fillCircle(131, 195, 2);
        g.fillCircle(137, 200, 2);
        g.fillCircle(149, 193, 2);
        g.fillCircle(155, 199, 2);
      },
    },
    nube: {
      name: 'Nube con estrellas',
      draw(g) {
        setColor(g, 0xffffff);
        g.fillCircle(60, 236, 26);
        g.fillCircle(90, 222, 30);
        g.fillCircle(124, 222, 30);
        g.fillCircle(150, 236, 26);
        g.fillRect(50, 236, 110, 22);
        drawStar(g, 40, 214, 6, 0xffe27a);
        drawStar(g, 164, 210, 7, 0xffe27a);
        drawStar(g, 100, 200, 5, 0xffe27a);
      },
    },
    hierba: {
      name: 'Jardín de flores',
      draw(g) {
        setColor(g, 0x8fe0a8);
        g.fillRoundedRect(14, 226, 172, 34, 8);
        setColor(g, 0x6fd191);
        for (let x = 22; x <= 178; x += 12) {
          g.fillTriangle(x - 5, 226, x + 5, 226, x, 210);
        }
        drawFlower(g, 45, 218, 6, 0xffb6c9, 0xfff3a0);
        drawFlower(g, 100, 214, 6, 0xffffff, 0xfff3a0);
        drawFlower(g, 155, 218, 6, 0xaed6f1, 0xfff3a0);
      },
    },
    lunares: {
      name: 'Alfombra de lunares pastel',
      draw(g) {
        setColor(g, 0xfff0f5);
        g.fillEllipse(100, 248, 182, 40);
        const dots = [0xffb6c9, 0xaed6f1, 0xfff3a0, 0xc9f0d1, 0xd6b8f0];
        let i = 0;
        for (let x = 34; x <= 166; x += 22) {
          setColor(g, dots[i % dots.length]);
          g.fillCircle(x, 248, 9);
          i += 1;
        }
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
