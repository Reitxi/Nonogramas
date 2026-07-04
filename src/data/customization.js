// Catálogo de personalización del perro: ropa, cabeza, collar, cajón y fondos.
window.Nonogram = window.Nonogram || {};

Nonogram.Customization = (() => {
  const catalog = Nonogram.Render.CATALOG;

  function toItems(group) {
    return Object.keys(group).map((id) => ({
      id,
      name: group[id].name,
    }));
  }

  const items = {
    clothing: toItems(catalog.clothing),
    headwear: toItems(catalog.headwear),
    collar: toItems(catalog.collar),
    drawer: toItems(catalog.drawer),
  };

  const categories = [
    { key: 'clothing', label: 'Ropa' },
    { key: 'headwear', label: 'Cabeza' },
    { key: 'collar', label: 'Collar' },
    { key: 'drawer', label: 'Cajón' },
  ];

  const defaults = {
    clothing: items.clothing[0].id,
    headwear: items.headwear[0].id,
    collar: items.collar[0].id,
    drawer: items.drawer[0].id,
  };

  const backgrounds = [
    { id: 'celeste', name: 'Celeste', color: '#aed6f1' },
    { id: 'rosa', name: 'Rosa', color: '#f5cba7' },
    { id: 'menta', name: 'Menta', color: '#a3e4d7' },
    { id: 'lila', name: 'Lila', color: '#d7bde2' },
    { id: 'amarillo', name: 'Amarillo pastel', color: '#f9e79f' },
    { id: 'carbon', name: 'Gris carbón', color: '#34495e' },
  ];

  function getItem(category, id) {
    return items[category].find((item) => item.id === id) || null;
  }

  function getBackgroundColor(id) {
    const bg = backgrounds.find((b) => b.id === id) || backgrounds[0];
    return bg.color;
  }

  return { categories, items, defaults, backgrounds, getItem, getBackgroundColor };
})();
