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
  //   cuerpo: cuello estrecho justo bajo la barbilla que se ensancha poco a poco hacia
  //           el pecho (silueta alargada, no una bola), con las caderas marcadas antes
  //           de las patas — como la silueta de un perro sentado normal.
  //   patas:  y 198-259, sombreadas más oscuras que el torso para distinguirlas bien

  function setColor(g, color, alpha) {
    g.fillStyle(color, alpha === undefined ? 1 : alpha);
  }

  // Silueta del cuerpo SENTADO como una sola forma: cuello estrecho pegado a la barbilla
  // que se ensancha gradualmente (nunca de golpe, para no parecer una bola), con las
  // caderas marcando un bulto redondeado a los lados justo antes de las patas delanteras.
  const BODY_POINTS = [
    { x: 100, y: 144 },
    { x: 114, y: 150 },
    { x: 124, y: 163 },
    { x: 131, y: 180 },
    { x: 134, y: 198 },
    { x: 142, y: 213 },
    { x: 138, y: 229 },
    { x: 130, y: 246 },
    { x: 122, y: 259 },
    { x: 100, y: 259 },
    { x: 78, y: 259 },
    { x: 70, y: 246 },
    { x: 62, y: 229 },
    { x: 58, y: 213 },
    { x: 66, y: 198 },
    { x: 69, y: 180 },
    { x: 76, y: 163 },
    { x: 86, y: 150 },
  ];

  function bodySilhouette(g, color) {
    setColor(g, color);
    g.fillPoints(BODY_POINTS, true);
  }

  // Sombreado de caderas + patas delanteras: una capa algo más oscura que el torso,
  // pintada encima de la silueta base, para que las patas se distingan del cuerpo
  // incluso sin ropa. La base sigue siendo una silueta continua (sin recortes profundos,
  // como en un perro de verdad); la separación entre las dos patas se marca con una
  // línea fina, no con una muesca en el contorno.
  const LEG_SHADE_POINTS = [
    { x: 134, y: 198 },
    { x: 142, y: 213 },
    { x: 138, y: 229 },
    { x: 130, y: 246 },
    { x: 122, y: 259 },
    { x: 100, y: 259 },
    { x: 78, y: 259 },
    { x: 70, y: 246 },
    { x: 62, y: 229 },
    { x: 58, y: 213 },
    { x: 66, y: 198 },
    { x: 80, y: 208 },
    { x: 100, y: 210 },
    { x: 120, y: 208 },
  ];

  function drawLegsAndPaws(g) {
    setColor(g, DOG.furShadow);
    g.fillPoints(LEG_SHADE_POINTS, true);

    // línea fina que separa visualmente las dos patas delanteras
    g.lineStyle(3, DOG.furBase, 0.85);
    g.beginPath();
    g.moveTo(100, 212);
    g.lineTo(100, 257);
    g.strokePath();

    // patas: manchas más claras al final de cada pata + líneas de separación de dedos
    setColor(g, DOG.furLight);
    g.fillEllipse(111, 251, 20, 15);
    g.fillEllipse(89, 251, 20, 15);
    g.lineStyle(2, DOG.furShadow, 0.55);
    [104, 111, 118].forEach((x) => {
      g.beginPath();
      g.moveTo(x, 246);
      g.lineTo(x, 258);
      g.strokePath();
    });
    [82, 89, 96].forEach((x) => {
      g.beginPath();
      g.moveTo(x, 246);
      g.lineTo(x, 258);
      g.strokePath();
    });
  }

  // La ropa solo cubre el torso (hasta justo antes de las caderas), para que las patas
  // siempre se vean con su color natural por debajo de la prenda.
  const TORSO_POINTS = [
    { x: 100, y: 144 },
    { x: 114, y: 150 },
    { x: 124, y: 163 },
    { x: 131, y: 180 },
    { x: 134, y: 198 },
    { x: 120, y: 208 },
    { x: 100, y: 210 },
    { x: 80, y: 208 },
    { x: 66, y: 198 },
    { x: 69, y: 180 },
    { x: 76, y: 163 },
    { x: 86, y: 150 },
  ];

  function torsoFit(g, color) {
    setColor(g, color);
    g.fillPoints(TORSO_POINTS, true);
  }

  // Perfil derecho del torso (x del contorno a cada altura y), para poder acotar
  // cualquier decoración de ropa a un ancho seguro y que nunca sobresalga de la silueta.
  const TORSO_PROFILE = [
    { y: 144, x: 100 },
    { y: 150, x: 114 },
    { y: 163, x: 124 },
    { y: 180, x: 131 },
    { y: 198, x: 134 },
    { y: 208, x: 120 },
    { y: 210, x: 100 },
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

  // Banda de collar: solo el arco delantero (lados + parte de abajo), nunca un óvalo
  // cerrado, para que la parte de atrás quede oculta detrás del cuello del perro en vez
  // de flotar por delante como si el collar no lo rodeara de verdad.
  function collarBand(g, cy, rx, ry, lineWidth, color) {
    g.lineStyle(lineWidth, color, 1);
    g.beginPath();
    const steps = 28;
    const a0 = 12;
    const a1 = 168;
    for (let i = 0; i <= steps; i++) {
      const t = a0 + ((a1 - a0) * i) / steps;
      const rad = Phaser.Math.DegToRad(t);
      const x = 100 + rx * Math.cos(rad);
      const y = cy + ry * Math.sin(rad);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokePath();
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
    // cuerpo: el propio contorno ya estrecha el cuello justo bajo la barbilla, así que
    // la ropa lo abraza con normalidad sin dejar un hueco de piel ni formar una bola.
    bodySilhouette(g, DOG.furBase);
    drawLegsAndPaws(g);

    // remata la unión entre la barbilla y el cuello para que no se note la costura
    setColor(g, DOG.furBase);
    g.fillEllipse(100, 143, 36, 10);

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
        g.fillEllipse(100, 152, safeWidth(152), 8);
        drawHeart(g, 100, 182, 9, 0xffffff);
        setColor(g, 0xff6fa5);
        g.fillCircle(100, 182, 2);
      },
    },
    rayas: {
      name: 'Camiseta de rayitas pastel',
      draw(g) {
        torsoFit(g, 0xfff8ee);
        setColor(g, 0x9fdfc4);
        [160, 175, 195].forEach((y) => g.fillEllipse(100, y, safeWidth(y), 7));
      },
    },
    chaqueta: {
      name: 'Chaqueta lavanda de flores',
      draw(g) {
        torsoFit(g, 0xd0bdf0);
        setColor(g, 0xb49ddb);
        g.fillEllipse(100, 152, safeWidth(152), 8);
        g.fillRect(97, 158, 6, 44);
        drawFlower(g, 100, 172, 6, 0xffe1ef, 0xf1c40f);
        drawFlower(g, 100, 190, 6, 0xffe1ef, 0xf1c40f);
      },
    },
    vestido: {
      name: 'Vestido de flores',
      draw(g) {
        setColor(g, 0xffb6c9);
        g.fillEllipse(100, 206, 76, 22);
        torsoFit(g, 0xffb6c9);
        setColor(g, 0xffffff);
        g.fillEllipse(100, 152, safeWidth(152) * 0.6, 7);
        drawFlower(g, 82, 172, 6, 0xffffff, 0xf7c9dc);
        drawFlower(g, 118, 172, 6, 0xffffff, 0xf7c9dc);
        drawFlower(g, 100, 190, 6, 0xffffff, 0xf7c9dc);
      },
    },
    chaleco: {
      name: 'Chaleco de corazones',
      draw(g) {
        torsoFit(g, 0xfff3e6);
        setColor(g, 0xf4a7b9);
        g.fillEllipse(100, 152, safeWidth(152), 7);
        drawHeart(g, 88, 172, 6, 0xf4a7b9);
        drawHeart(g, 112, 172, 6, 0xf4a7b9);
        drawHeart(g, 100, 190, 6, 0xf4a7b9);
      },
    },
    camiseta: {
      name: 'Camiseta de estrellitas',
      draw(g) {
        torsoFit(g, 0xfff2a8);
        setColor(g, 0xf7dd6c);
        g.fillEllipse(100, 152, safeWidth(152), 8);
        drawStar(g, 88, 174, 6, 0xffffff);
        drawStar(g, 112, 174, 6, 0xffffff);
        drawStar(g, 100, 192, 7, 0xffffff);
      },
    },
    peto: {
      name: 'Peto con margaritas',
      draw(g) {
        // camiseta base bien contrastada con el pelaje (crema muy claro, casi blanco)
        torsoFit(g, 0xfff8ee);
        setColor(g, 0x9fc6ea);
        g.fillRoundedRect(83, 168, 34, 38, 8);
        g.fillRoundedRect(82, 156, 7, 20, 3);
        g.fillRoundedRect(111, 156, 7, 20, 3);
        setColor(g, 0x7fb0dd);
        g.fillCircle(85, 158, 3);
        g.fillCircle(115, 158, 3);
        setColor(g, 0x87b8e0);
        g.fillRoundedRect(91, 184, 18, 14, 3);
        drawFlower(g, 100, 176, 6, 0xffffff, 0xf1c40f);
      },
    },
    poncho: {
      name: 'Poncho arcoíris pastel',
      draw(g) {
        torsoFit(g, 0xfff8f0);
        const colors = [0xffb6c9, 0xffd9a0, 0xfff3a0, 0xb8e8c4, 0xaed6f1];
        const ys = [155, 165, 175, 185, 195];
        colors.forEach((c, i) => {
          setColor(g, c);
          g.fillEllipse(100, ys[i], safeWidth(ys[i]), 7);
        });
        // flecos colgando del borde inferior, la seña de identidad del poncho
        setColor(g, 0xe8b7c9);
        const hemHalf = safeWidth(205) / 2;
        for (let x = 100 - hemHalf + 5; x <= 100 + hemHalf - 5; x += 9) {
          g.fillTriangle(x - 3, 203, x + 3, 203, x, 211);
        }
      },
    },
    abrigo: {
      name: 'Abrigo de nieve con pompones',
      draw(g) {
        torsoFit(g, 0xfbfcfe);
        setColor(g, 0xdcecf9);
        g.fillRect(97, 158, 6, 42);
        g.fillRect(100 - safeWidth(172) / 2, 172, safeWidth(172), 4);
        g.fillRect(100 - safeWidth(190) / 2, 190, safeWidth(190), 4);
        setColor(g, 0xffffff);
        const pomWidth = safeWidth(153);
        [-0.36, -0.18, 0, 0.18, 0.36].forEach((f) => g.fillCircle(100 + f * pomWidth, 153, 6));
      },
    },
    pijama: {
      name: 'Pijama de nubes',
      draw(g) {
        torsoFit(g, 0xcfe8f7);
        setColor(g, 0xffffff);
        g.fillCircle(90, 168, 7);
        g.fillCircle(100, 164, 8);
        g.fillCircle(110, 168, 7);
        g.fillCircle(90, 190, 6);
        g.fillCircle(100, 194, 7);
        g.fillCircle(110, 190, 6);
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
        g.fillEllipse(78, 34, 20, 58);
        g.fillEllipse(122, 34, 20, 58);
        setColor(g, 0xf5b7b1);
        g.fillEllipse(78, 38, 9, 38);
        g.fillEllipse(122, 38, 9, 38);
        setColor(g, 0xecf0f1);
        g.fillEllipse(100, 66, 92, 14);
      },
    },
    navidad: {
      name: 'Gorro navideño',
      draw(g) {
        setColor(g, 0xc0392b);
        g.fillPoints(
          [
            { x: 62, y: 78 }, { x: 70, y: 40 }, { x: 118, y: 30 }, { x: 138, y: 46 },
          ],
          true
        );
        setColor(g, 0xffffff);
        g.fillEllipse(100, 78, 100, 16);
        g.fillCircle(138, 42, 9);
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

  // --- Collar: banda justo debajo de la barbilla, sobre el pecho. Se dibuja DESPUÉS de la
  // ropa (ver order en buildDogContainer) para que sus detalles nunca queden tapados por
  // ninguna prenda, igual que un collar real, que siempre queda por fuera de la ropa.
  const COLLAR = {
    rojo: {
      name: 'Collar rojo',
      draw(g) {
        collarBand(g, 150, 20, 8, 7, 0xc0392b);
        setColor(g, 0xf1c40f);
        g.fillCircle(100, 160, 4.5);
      },
    },
    pajarita: {
      name: 'Pajarita',
      draw(g) {
        collarBand(g, 148, 18, 7, 4, 0x1b4f72);
        setColor(g, 0x2980b9);
        g.fillTriangle(84, 150, 100, 160, 84, 170);
        g.fillTriangle(116, 150, 100, 160, 116, 170);
        setColor(g, 0x1b4f72);
        g.fillCircle(100, 160, 4.5);
      },
    },
    hueso: {
      name: 'Collar con hueso',
      draw(g) {
        collarBand(g, 150, 20, 8, 5, 0x7f8c8d);
        setColor(g, 0xecf0f1);
        g.fillRoundedRect(90, 158, 20, 8, 3.5);
        g.fillCircle(90, 158, 4.5);
        g.fillCircle(90, 166, 4.5);
        g.fillCircle(110, 158, 4.5);
        g.fillCircle(110, 166, 4.5);
      },
    },
    bufanda: {
      name: 'Bufanda',
      draw(g) {
        collarBand(g, 149, 22, 9, 12, 0xe67e22);
        setColor(g, 0xaf601a);
        g.fillRoundedRect(94, 160, 12, 26, 5);
      },
    },
    flores: {
      name: 'Collar de flores',
      draw(g) {
        collarBand(g, 150, 20, 8, 4, 0x27ae60);
        [72, 86, 100, 114, 128].forEach((x) => drawFlower(g, x, x === 100 ? 162 : 156, 5, 0xe91e63, 0xf1c40f));
      },
    },
    perlas: {
      name: 'Collar de perlas',
      draw(g) {
        setColor(g, 0xfdfefe);
        const pearls = [
          { x: 72, y: 148 }, { x: 83, y: 155 }, { x: 92, y: 160 }, { x: 100, y: 162 },
          { x: 108, y: 160 }, { x: 117, y: 155 }, { x: 128, y: 148 },
        ];
        pearls.forEach((p) => g.fillCircle(p.x, p.y, 5));
      },
    },
    campana: {
      name: 'Collar con campana',
      draw(g) {
        collarBand(g, 150, 20, 8, 6, 0xe74c3c);
        setColor(g, 0xf1c40f);
        g.fillCircle(100, 163, 7);
        setColor(g, 0xd4ac0d);
        g.fillRect(97, 163, 6, 4);
        setColor(g, 0xb7791d);
        g.fillCircle(100, 171, 2.2);
      },
    },
    corbata: {
      name: 'Corbata',
      draw(g) {
        collarBand(g, 148, 20, 7, 5, 0x2c3e50);
        setColor(g, 0xc0392b);
        g.fillTriangle(93, 152, 107, 152, 100, 166);
        g.fillTriangle(95, 166, 105, 166, 100, 195);
      },
    },
    estrellas: {
      name: 'Collar de estrellas',
      draw(g) {
        collarBand(g, 150, 20, 8, 4, 0x2980b9);
        [76, 90, 110, 124].forEach((x) => drawStar(g, x, x === 90 || x === 110 ? 162 : 156, 5, 0xf1c40f));
      },
    },
    arcoiris: {
      name: 'Collar arcoíris',
      draw(g) {
        const colors = [0xe74c3c, 0xf39c12, 0xf1c40f, 0x27ae60, 0x3498db];
        colors.forEach((c, i) => {
          collarBand(g, 145 + i * 3, 21 - i, 8, 3, c);
        });
      },
    },
  };

  // --- Cajón / asiento: detrás del perro, parte inferior del lienzo. Es grande y baja
  // bastante por debajo de las patas, para que se vea bien alrededor y por debajo de la
  // silueta del perro (que ya no lo tapa por completo).
  const DRAWER = {
    caja: {
      name: 'Cajita de regalo',
      draw(g) {
        setColor(g, 0xffd3e8);
        g.fillRoundedRect(6, 208, 188, 78, 16);
        setColor(g, 0xff9ec7);
        g.fillRect(92, 208, 16, 78);
        g.fillRect(6, 234, 188, 16);
        setColor(g, 0xff6fa5);
        g.fillTriangle(70, 194, 100, 212, 70, 228);
        g.fillTriangle(130, 194, 100, 212, 130, 228);
        g.fillCircle(100, 212, 7);
      },
    },
    cesta: {
      name: 'Cestita con corazón',
      draw(g) {
        setColor(g, 0xf3d9b1);
        g.fillRoundedRect(6, 208, 188, 78, 30);
        g.lineStyle(3, 0xd8b98a, 1);
        for (let y = 216; y <= 278; y += 11) {
          g.beginPath();
          g.moveTo(10, y);
          g.lineTo(190, y);
          g.strokePath();
        }
        drawHeart(g, 100, 212, 11, 0xf4a7b9);
      },
    },
    cojin: {
      name: 'Cojín de nube',
      draw(g) {
        setColor(g, 0xeaf6ff);
        g.fillCircle(56, 258, 34);
        g.fillCircle(90, 240, 40);
        g.fillCircle(130, 240, 40);
        g.fillCircle(158, 258, 34);
        g.fillRoundedRect(40, 250, 134, 40, 20);
        setColor(g, 0xbfe3f7);
        g.fillCircle(88, 262, 4);
        g.fillCircle(112, 262, 4);
      },
    },
    manta: {
      name: 'Manta de rayitas pastel',
      draw(g) {
        setColor(g, 0xffe9c7);
        g.fillRoundedRect(6, 208, 188, 78, 16);
        setColor(g, 0xffcf94);
        g.fillRect(6, 220, 188, 8);
        g.fillRect(6, 242, 188, 8);
        g.fillRect(6, 264, 188, 8);
      },
    },
    alfombra: {
      name: 'Alfombra arcoíris pastel',
      draw(g) {
        const colors = [0xffd3e0, 0xffe7c2, 0xfff6b8, 0xc9f0d1, 0xc6e6fb];
        colors.forEach((c, i) => {
          setColor(g, c);
          g.fillEllipse(100, 272, 196 - i * 18, 42 - i * 4);
        });
      },
    },
    cama: {
      name: 'Cama con corazones',
      draw(g) {
        setColor(g, 0xffe1ec);
        g.fillEllipse(100, 262, 192, 56);
        g.lineStyle(11, 0xffb6c9, 1);
        g.strokeEllipse(100, 256, 178, 42);
        drawHeart(g, 100, 256, 11, 0xff9ec7);
      },
    },
    tronco: {
      name: 'Tronco con setas',
      draw(g) {
        setColor(g, 0xc39066);
        g.fillRoundedRect(14, 212, 172, 76, 18);
        g.lineStyle(3, 0x9c6b41, 1);
        g.strokeEllipse(46, 250, 32, 62);
        g.strokeEllipse(100, 250, 22, 62);
        g.strokeEllipse(154, 250, 28, 62);
        setColor(g, 0xffffff);
        g.fillRect(136, 200, 6, 12);
        g.fillRect(156, 198, 6, 14);
        setColor(g, 0xe74c3c);
        g.fillCircle(139, 195, 9);
        g.fillCircle(159, 193, 10);
        setColor(g, 0xffffff);
        g.fillCircle(136, 192, 2.2);
        g.fillCircle(142, 198, 2.2);
        g.fillCircle(155, 190, 2.2);
        g.fillCircle(163, 196, 2.2);
      },
    },
    nube: {
      name: 'Nube con estrellas',
      draw(g) {
        setColor(g, 0xffffff);
        g.fillCircle(50, 258, 30);
        g.fillCircle(88, 240, 36);
        g.fillCircle(132, 240, 36);
        g.fillCircle(166, 258, 30);
        g.fillRoundedRect(38, 250, 138, 30, 16);
        drawStar(g, 26, 224, 7, 0xffe27a);
        drawStar(g, 178, 220, 8, 0xffe27a);
        drawStar(g, 100, 208, 6, 0xffe27a);
      },
    },
    hierba: {
      name: 'Jardín de flores',
      draw(g) {
        setColor(g, 0x8fe0a8);
        g.fillRoundedRect(6, 232, 188, 52, 12);
        setColor(g, 0x6fd191);
        for (let x = 14; x <= 190; x += 14) {
          g.fillTriangle(x - 6, 232, x + 6, 232, x, 208);
        }
        drawFlower(g, 36, 222, 7, 0xffb6c9, 0xfff3a0);
        drawFlower(g, 100, 216, 7, 0xffffff, 0xfff3a0);
        drawFlower(g, 164, 222, 7, 0xaed6f1, 0xfff3a0);
      },
    },
    lunares: {
      name: 'Alfombra de lunares pastel',
      draw(g) {
        setColor(g, 0xfff0f5);
        g.fillEllipse(100, 268, 196, 48);
        const dots = [0xffb6c9, 0xaed6f1, 0xfff3a0, 0xc9f0d1, 0xd6b8f0];
        let i = 0;
        for (let x = 24; x <= 176; x += 20) {
          setColor(g, dots[i % dots.length]);
          g.fillCircle(x, 268, 10);
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
    // El cajón va detrás; la ropa se dibuja encima del perro base, el collar encima de la
    // ropa (como un collar real, que siempre queda visible por fuera) y el gorro delante de todo.
    const order = ['drawer', 'dog', 'clothing', 'collar', 'headwear'];
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
