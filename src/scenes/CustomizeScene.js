// Personalización del perro: ropa, cabeza, collar, cajón y fondo.
window.Nonogram = window.Nonogram || {};

Nonogram.Scenes = Nonogram.Scenes || {};

Nonogram.Scenes.CustomizeScene = class CustomizeScene extends Phaser.Scene {
  constructor() {
    super('CustomizeScene');
  }

  create() {
    this.equipped = Nonogram.State.getEquipped();
    this.backgroundId = Nonogram.State.getBackground();
    this.cameras.main.setBackgroundColor(Nonogram.Customization.getBackgroundColor(this.backgroundId));

    this.add.text(30, 20, 'Personaliza a tu perro', { fontSize: '28px', color: '#2c3e50', fontStyle: 'bold' });

    this.dogContainer = Nonogram.Render.buildDogContainer(this, 60, 90, this.equipped);
    this.dogContainer.setScale(1.4);

    const backBtn = this.add
      .text(30, 490, '< Volver al menú', {
        fontSize: '18px',
        color: '#2c3e50',
        backgroundColor: '#ffffffcc',
        padding: { x: 10, y: 6 },
      })
      .setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.tabs = [...Nonogram.Customization.categories, { key: 'background', label: 'Fondo' }];
    this.activeTab = this.tabs[0].key;
    this.tabTexts = {};

    const tabStartX = 360;
    this.tabs.forEach((tab, i) => {
      const t = this.add
        .text(tabStartX, 80 + i * 45, tab.label, {
          fontSize: '18px',
          color: '#2c3e50',
          backgroundColor: '#ffffffaa',
          padding: { x: 10, y: 6 },
        })
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        this.activeTab = tab.key;
        this.renderTabHighlight();
        this.renderItemList();
      });
      this.tabTexts[tab.key] = t;
    });

    this.itemListGroup = this.add.group();
    this.renderTabHighlight();
    this.renderItemList();
  }

  renderTabHighlight() {
    Object.keys(this.tabTexts).forEach((key) => {
      this.tabTexts[key].setStyle({ backgroundColor: key === this.activeTab ? '#f1c40f' : '#ffffffaa' });
    });
  }

  renderItemList() {
    this.itemListGroup.clear(true, true);
    const startX = 520;
    const startY = 80;
    const itemW = 160;
    const itemH = 60;
    const gap = 12;

    if (this.activeTab === 'background') {
      Nonogram.Customization.backgrounds.forEach((bg, i) => {
        const x = startX;
        const y = startY + i * (itemH + gap);
        const swatch = this.add
          .rectangle(x, y, itemW, itemH, Phaser.Display.Color.HexStringToColor(bg.color).color)
          .setOrigin(0, 0)
          .setInteractive({ useHandCursor: true });
        const label = this.add
          .text(x + itemW / 2, y + itemH / 2, bg.name, { fontSize: '14px', color: '#2c3e50' })
          .setOrigin(0.5);
        if (bg.id === this.backgroundId) swatch.setStrokeStyle(4, 0xf1c40f);
        swatch.on('pointerdown', () => {
          this.backgroundId = bg.id;
          Nonogram.State.setBackground(bg.id);
          this.cameras.main.setBackgroundColor(bg.color);
          this.renderItemList();
        });
        this.itemListGroup.addMultiple([swatch, label]);
      });
      return;
    }

    const category = this.activeTab;
    Nonogram.Customization.items[category].forEach((item, i) => {
      const x = startX;
      const y = startY + i * (itemH + gap);
      const box = this.add
        .rectangle(x, y, itemW, itemH, 0xffffff, 0.85)
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(x + itemW / 2, y + itemH / 2, item.name, {
          fontSize: '14px',
          color: '#2c3e50',
          align: 'center',
          wordWrap: { width: itemW - 10 },
        })
        .setOrigin(0.5);
      if (this.equipped[category] === item.id) box.setStrokeStyle(4, 0xf1c40f);
      box.on('pointerdown', () => {
        this.equipped[category] = item.id;
        Nonogram.State.setEquipped(category, item.id);
        Nonogram.Render.updateDogLayer(this.dogContainer, category, item.id);
        this.renderItemList();
      });
      this.itemListGroup.addMultiple([box, label]);
    });
  }
};
