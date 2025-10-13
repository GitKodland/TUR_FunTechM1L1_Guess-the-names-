import { EmojiPicker } from "./emojiPicker.js";
import { UI } from "./ui.js";
import { Game } from "./game.js";
import { applyTranslations, t } from "./lang.js"; // <-- добавлено

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
    const pairs = ui.getSetupData();
    if (!pairs.length) return alert("Введите хотя бы одно имя с эмодзи!");

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

  const createCard = (name) => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = name;
    card.dataset.name = name;
    card.draggable = true;
    addDragListeners(card);
    return card;
  };

  const addDragListeners = (card) => {
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.dataset.name);
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  };

  // назначить d&d всем карточкам в пуле
  pool.querySelectorAll(".card").forEach(addDragListeners);

  // функции для очистки и вставки карточек
  function placeCardInSlot(slot, name) {
    slot.dataset.assigned = name;
    slot.innerHTML = `<div class="emoji">${slot.dataset.emoji}</div>`;
    const innerCard = createCard(name);
    innerCard.style.marginTop = "3px";
    slot.appendChild(innerCard);
  }

  function clearSlot(slot) {
    slot.innerHTML = `<div class="emoji">${slot.dataset.emoji}</div>`;
    delete slot.dataset.assigned;
  }

  // обработка зон
  slots.forEach(slot => {
    slot.addEventListener("dragover", e => {
      e.preventDefault();
      slot.classList.add("active");
    });

    slot.addEventListener("dragleave", () => slot.classList.remove("active"));

    slot.addEventListener("drop", e => {
      e.preventDefault();
      slot.classList.remove("active");

      const name = e.dataTransfer.getData("text/plain");
      if (!name) return;

      // если слот уже занят другим — вернуть старую вниз
      const current = slot.dataset.assigned;
      if (current && current !== name) {
        const oldCard = createCard(current);
        pool.appendChild(oldCard);
      }

      // удалить карточку из пула, если она там
      const dragged = document.querySelector(`.card[data-name="${name}"]`);
      if (dragged) dragged.remove();

      // установить новую карточку
      placeCardInSlot(slot, name);
    });
  });

  // возврат карточки вниз
  pool.addEventListener("dragover", e => e.preventDefault());
  pool.addEventListener("drop", e => {
    e.preventDefault();
    const name = e.dataTransfer.getData("text/plain");
    if (!name) return;

    // найти слот, где эта карточка стояла
    const usedSlot = [...slots].find(s => s.dataset.assigned === name);
    if (usedSlot) {
      clearSlot(usedSlot);
    }

    // вернуть карточку вниз, если её ещё нет
    if (!pool.querySelector(`.card[data-name="${name}"]`)) {
      const card = createCard(name);
      pool.appendChild(card);
    }
  });
}

/* === СТАРТ === */
document.addEventListener("DOMContentLoaded", () => {
  applyTranslations(); // <-- применяем переводы при старте
  init();
});
