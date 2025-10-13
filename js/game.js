export class Game {
  constructor() {
    this.pairs = [];
  }

  setPairs(pairs) {
    this.pairs = pairs;
  }

  shuffledPairs() {
    return [...this.pairs].sort(() => Math.random() - 0.5);
  }

  // === Проверка для drag & drop ===
  checkByDrag(pairs, slots) {
    let ok = 0;
    const results = [];

    slots.forEach((slot) => {
      const emoji = slot.dataset.emoji;
      const name = slot.dataset.assigned || "";
      const correct = pairs.find(p => p.emoji === emoji)?.name === name;
      if (correct) ok++;
      results.push({ slot, correct });
    });

    return { results, ok, total: pairs.length, all: ok === pairs.length };
  }
}
