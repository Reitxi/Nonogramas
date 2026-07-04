// Estado persistente del juego (localStorage), versionado y a prueba de fallos.
window.Nonogram = window.Nonogram || {};

Nonogram.State = (() => {
  const VERSION = 1;
  const PREFIX = `nonogram.v${VERSION}.`;

  const DEFAULTS = {
    completedPuzzles: [],
    equipped: {
      clothing: null,
      headwear: null,
      collar: null,
      drawer: null,
    },
    background: null,
  };

  function read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (err) {
      // localStorage no disponible (modo privado, cuota, etc.): se ignora, el juego sigue funcionando en memoria.
    }
  }

  function getCompletedPuzzles(validPuzzleIds) {
    const stored = read('completedPuzzles', DEFAULTS.completedPuzzles);
    if (!Array.isArray(stored)) return [];
    if (!validPuzzleIds) return stored;
    const validSet = new Set(validPuzzleIds);
    return stored.filter((id) => validSet.has(id));
  }

  function markPuzzleCompleted(puzzleId, validPuzzleIds) {
    const completed = getCompletedPuzzles(validPuzzleIds);
    if (!completed.includes(puzzleId)) {
      completed.push(puzzleId);
      write('completedPuzzles', completed);
    }
    return completed;
  }

  function getEquipped() {
    const stored = read('equipped', DEFAULTS.equipped);
    return { ...DEFAULTS.equipped, ...(stored && typeof stored === 'object' ? stored : {}) };
  }

  function setEquipped(category, itemId) {
    const equipped = getEquipped();
    equipped[category] = itemId;
    write('equipped', equipped);
    return equipped;
  }

  function getBackground() {
    return read('background', DEFAULTS.background);
  }

  function setBackground(backgroundId) {
    write('background', backgroundId);
  }

  return {
    getCompletedPuzzles,
    markPuzzleCompleted,
    getEquipped,
    setEquipped,
    getBackground,
    setBackground,
  };
})();
