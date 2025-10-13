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
    alert("Введите хотя бы одно имя с эмодзи!");
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

  // === Всегда отображаем область возврата ===
  pool.classList.add("drop-area-visible");
  if (!pool.querySelector(".drop-hint")) {
    const hint = document.createElement("div");
    hint.className = "drop-hint";
    hint.innerHTML = "⬇️ Перетащи карточку обратно сюда";
    pool.appendChild(hint);
  }

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
      e.stopPropagation();
      card.classList.add("dragging");
      pool.classList.add("active");
    });
    card.addEventListener("dragend", (e) => {
      e.stopPropagation();
      card.classList.remove("dragging");
      pool.classList.remove("active");
    });
  };

  // добавить d&d всем карточкам в пуле
  pool.querySelectorAll(".card").forEach(addDragListeners);

  // вставка карточки в слот
  function placeCardInSlot(slot, name) {
    slot.dataset.assigned = name;
    slot.innerHTML = `<div class="emoji">${slot.dataset.emoji}</div>`;
    const innerCard = createCard(name);
    innerCard.style.marginTop = "3px";
    slot.appendChild(innerCard);
  }

  // очистка слота
  function clearSlot(slot) {
    slot.innerHTML = `<div class="emoji">${slot.dataset.emoji}</div>`;
    delete slot.dataset.assigned;
  }

  // === обработка СЛОТОВ ===
  slots.forEach(slot => {
    slot.addEventListener("dragover", e => {
      e.preventDefault();
      slot.classList.add("active");
    });

    slot.addEventListener("dragleave", () => slot.classList.remove("active"));

    slot.addEventListener("drop", e => {
      e.preventDefault();
      e.stopPropagation();
      slot.classList.remove("active");

      const name = e.dataTransfer.getData("text/plain");
      if (!name) return;

      // если слот уже занят тем же именем — выходим
      if (slot.dataset.assigned === name) return;

      // если слот занят другим — вернуть старую карточку вниз
      const current = slot.dataset.assigned;
      if (current && current !== name && !pool.querySelector(`[data-name="${current}"]`)) {
        pool.appendChild(createCard(current));
      }

      // удалить карточку из пула (если она там)
      const draggedFromPool = pool.querySelector(`.card[data-name="${name}"]`);
      if (draggedFromPool) draggedFromPool.remove();

      // удалить дублирующие карточки из других слотов
      [...slots].forEach(s => {
        if (s !== slot && s.dataset.assigned === name) clearSlot(s);
      });

      // вставить карточку
      placeCardInSlot(slot, name);
    });
  });

  // === обработка ОБЛАСТИ ВОЗВРАТА ===
  pool.addEventListener("dragover", e => {
    e.preventDefault();
    pool.classList.add("active");
  });

  pool.addEventListener("dragleave", () => pool.classList.remove("active"));

  pool.addEventListener("drop", e => {
    e.preventDefault();
    e.stopPropagation();
    pool.classList.remove("active");

    const name = e.dataTransfer.getData("text/plain");
    if (!name) return;

    // найти слот, где карточка стояла
    const usedSlot = [...slots].find(s => s.dataset.assigned === name);
    if (usedSlot) clearSlot(usedSlot);

    // если карточка уже есть в пуле — не дублируем
    if (!pool.querySelector(`.card[data-name="${name}"]`)) {
      // удалить подсказку, потом вернуть её в конец
      const hint = pool.querySelector(".drop-hint");
      if (hint) hint.remove();

      pool.appendChild(createCard(name));

      // вернуть подсказку обратно (чтобы всегда была видна)
      const newHint = document.createElement("div");
      newHint.className = "drop-hint";
      newHint.innerHTML = "⬇️ Перетащи карточку обратно сюда";
      pool.appendChild(newHint);
    }
  });
}



/* === СТАРТ === */
document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();
  init();
});
