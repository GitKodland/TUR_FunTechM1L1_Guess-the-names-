import { EmojiPicker } from "./emojiPicker.js";
import { UI } from "./ui.js";
import { Game } from "./game.js";
import { applyTranslations, t } from "./lang.js";

const ui = new UI();
const game = new Game();

let currentIndex = null;
let savedPairs = [];

/* === ЭМОДЗИ ПИКЕР === */
const picker = new EmojiPicker({
  gridEl: document.getElementById("emojiGrid"),
  modalEl: document.getElementById("emojiModal"),
  onSelect: emoji => {
    const prev = ui.setupList.querySelector(`.row[data-index="${currentIndex}"] .emoji-selected`).dataset.emoji;
    if (prev) picker.unmarkUsed(prev);
    ui.setEmoji(currentIndex, emoji);
    picker.markUsed(emoji);
  },
  onClose: () => (currentIndex = null)
});

/* === ИНИЦИАЛИЗАЦИЯ === */
function init() {
  ui.renderSetupRows(i => {
    currentIndex = i;
    picker.show();
  });

  // --- Подсказка ---
  document.getElementById("openHintBtn").addEventListener("click", () => ui.hintModal.classList.remove("hidden"));
  document.getElementById("hintClose").addEventListener("click", () => ui.hintModal.classList.add("hidden"));

  // --- Принять ---
document.getElementById("acceptBtn").addEventListener("click", () => {
  // Собираем все 10 строк (включая пустые) для подсветки по индексам
  const allRows = [...ui.setupList.querySelectorAll(".row")].map((r, i) => ({
    index: i,
    name: r.querySelector(".name-input").value.trim(),
    emoji: r.querySelector(".emoji-selected").dataset.emoji || ""
  }));

  // Оставляем только заполненные пары
  const pairs = allRows.filter(p => p.name && p.emoji);
  if (!pairs.length) {
     alert(t("needOnePair"));
     return;
  }

  // === Проверка дублей имён (без регистра и лишних пробелов)
  const map = new Map(); // normName -> [indexes]
  allRows.forEach(p => {
    if (!p.name) return;
    const norm = p.name.toLowerCase();
    if (!map.has(norm)) map.set(norm, []);
    map.get(norm).push(p.index);
  });

  const dupIndexes = [...map.values()].filter(arr => arr.length > 1).flat();
  if (dupIndexes.length) {
    ui.markSetupErrors(dupIndexes);
    alert(t("duplicateNames"));
    return;
  }
  ui.clearSetupErrors();

  // всё ок — продолжаем
  savedPairs = pairs;
  game.setPairs(pairs);

  const shuffled = game.shuffledPairs();
  ui.renderQuizDragDrop(shuffled);
  ui.toQuiz();
  ui.updateHint(pairs, "quiz");

  initDragDrop(shuffled);
});


  // --- Назад ---
  document.getElementById("backBtn").addEventListener("click", () => {
    ui.toSetup();
    ui.updateHint([], "setup");
  });

  // --- Проверить ---
  document.getElementById("checkBtn").addEventListener("click", () => {
    const slots = [...document.querySelectorAll(".drop-slot")];
    const { results, ok, total, all } = game.checkByDrag(savedPairs, slots);
    ui.markResults(results);
    ui.showResult(all, ok, total);
  });

  // --- Закрытие модалки результата ---
  document.getElementById("resultClose").addEventListener("click", () => {
    ui.resultModal.classList.add("hidden");
  });
}

/* === DRAG & DROP === */
function initDragDrop(pairs) {
  const pool = document.getElementById("namePool");
  const slots = document.querySelectorAll(".drop-slot");

  // Создание карточки
  const createCard = (name) => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = name;
    card.dataset.name = name;
    card.draggable = true;
    addDragListeners(card);
    return card;
  };

  // Слушатели для карточек
  const addDragListeners = (card) => {
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", card.dataset.name);
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  };

  // Инициализация карточек
  pool.querySelectorAll(".card").forEach(addDragListeners);

  // Размещение карточки в слот
  function placeCardInSlot(slot, name) {
    slot.dataset.assigned = name;
    slot.innerHTML = `<div class="emoji">${slot.dataset.emoji}</div>`;
    const innerCard = createCard(name);
    slot.appendChild(innerCard);
  }

  // Очистка слота
  function clearSlot(slot) {
    slot.innerHTML = `<div class="emoji">${slot.dataset.emoji}</div>`;
    delete slot.dataset.assigned;
  }

  // --- Основная логика drop в слоты ---
  slots.forEach(slot => {
    slot.addEventListener("dragover", e => {
      e.preventDefault();
      slot.classList.add("active");
    });

    slot.addEventListener("dragleave", () => slot.classList.remove("active"));

    slot.addEventListener("drop", e => {
      e.preventDefault();
      slot.classList.remove("active");

      const dragged = document.querySelector(".card.dragging");
      if (!dragged) return; // защита от посторонних элементов

      const name = dragged.dataset.name;
      if (!name) return;

      // если в слоте уже есть это имя — ничего не делаем
      if (slot.dataset.assigned === name) return;

      // если в слоте было другое имя — вернуть обратно в пул
      const current = slot.dataset.assigned;
      if (current && current !== name) {
        const oldCard = createCard(current);
        pool.appendChild(oldCard);
      }

      // удалить перетаскиваемую карточку из пула
      dragged.remove();

      // вставить новую в слот
      placeCardInSlot(slot, name);
    });
  });

  // --- Возврат карточек вниз ---
  pool.addEventListener("dragover", e => e.preventDefault());

  pool.addEventListener("drop", e => {
    e.preventDefault();
    const dragged = document.querySelector(".card.dragging");
    if (!dragged) return;

    const name = dragged.dataset.name;
    if (!name) return;

    // найти слот, где карточка стояла
    const usedSlot = [...slots].find(s => s.dataset.assigned === name);
    if (usedSlot) clearSlot(usedSlot);

    // если такой карточки нет в пуле — вернуть
    if (!pool.querySelector(`.card[data-name="${name}"]`)) {
      pool.appendChild(createCard(name));
    }
  });

  // --- Подсказка (drop-hint) ---
  pool.classList.add("drop-area-visible");
  if (!pool.querySelector(".drop-hint")) {
    const hint = document.createElement("div");
    hint.className = "drop-hint";
    hint.textContent = t("dropHint");
    pool.appendChild(hint);
  }
}




/* === СТАРТ === */
document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();
  init();
});
