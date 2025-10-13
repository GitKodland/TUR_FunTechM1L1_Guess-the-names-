// js/ui.js
import { t } from "./lang.js";

export class UI {
  constructor() {
    // Окна
    this.winSetup = document.getElementById("winSetup");
    this.winQuiz = document.getElementById("winQuiz");

    // Списки
    this.setupList = document.getElementById("setupList");
    this.quizList = document.getElementById("quizList");

    // Пул карточек имён (во 2 окне)
    this.namePool = document.getElementById("namePool");

    // Модалки
    this.hintModal = document.getElementById("hintModal");
    this.resultModal = document.getElementById("resultModal");

    // Элементы модалки результата
    this.resultGif = document.getElementById("resultGif");
    this.resultTitle = document.getElementById("resultTitle");
    this.resultText = document.getElementById("resultText");
  }

  /* ---------- Переключение окон ---------- */
  toSetup() {
    this.winQuiz.classList.add("hidden");
    this.winSetup.classList.remove("hidden");
  }

  toQuiz() {
    this.winSetup.classList.add("hidden");
    this.winQuiz.classList.remove("hidden");
  }

  /* ---------- Окно 1: строки ввода ---------- */
  renderSetupRows(onPick) {
    this.setupList.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const row = document.createElement("div");
      row.className = "row";
      row.dataset.index = i;

      const input = document.createElement("input");
      input.className = "name-input";
      input.placeholder = `${i + 1}`;

      // при вводе убираем ошибку
      input.addEventListener("input", () => {
        const row = input.closest(".row");
        row.classList.remove("error");
      });

      const pick = document.createElement("button");
      pick.className = "btn pick-btn";
      pick.type = "button";
      pick.textContent = "🙂";
      pick.addEventListener("click", () => onPick(i));

      const emojiBox = document.createElement("div");
      emojiBox.className = "emoji-selected";
      emojiBox.textContent = "—";

      row.append(input, pick, emojiBox);
      this.setupList.appendChild(row);
    }
  }

  setEmoji(index, emoji) {
    const row = this.setupList.querySelector(`.row[data-index="${index}"]`);
    if (!row) return;
    const box = row.querySelector(".emoji-selected");
    if (!box) return;
    const prev = box.dataset.emoji;
    if (prev) box.classList.remove("active");
    box.dataset.emoji = emoji;
    box.textContent = emoji;
    box.classList.add("active");
  }

  getSetupData() {
    return [...this.setupList.querySelectorAll(".row")]
      .map((r) => ({
        name: r.querySelector(".name-input").value.trim(),
        emoji: r.querySelector(".emoji-selected").dataset.emoji || "",
      }))
      .filter((p) => p.name && p.emoji);
  }

  /* ---------- Проверка и подсветка ошибок ---------- */
  clearSetupErrors() {
    this.setupList.querySelectorAll(".row").forEach((r) => r.classList.remove("error"));
  }

  markSetupErrors(indexes = []) {
    this.clearSetupErrors();
    indexes.forEach((i) => {
      const row = this.setupList.querySelector(`.row[data-index="${i}"]`);
      if (row) row.classList.add("error");
    });
  }

  /* ---------- Окно 2: drag & drop ---------- */
  renderQuizDragDrop(pairs) {
    this.quizList.innerHTML = "";
    this.namePool = document.getElementById("namePool");
    if (this.namePool) this.namePool.innerHTML = "";

    // Верх: слоты с эмодзи
    pairs.forEach((p) => {
      const slot = document.createElement("div");
      slot.className = "drop-slot";
      slot.dataset.emoji = p.emoji;

      const emoji = document.createElement("div");
      emoji.className = "emoji";
      emoji.textContent = p.emoji;

      slot.append(emoji);
      this.quizList.appendChild(slot);
    });

    // Низ: карточки имён
    pairs.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      card.textContent = p.name;
      card.draggable = true;
      card.dataset.name = p.name;
      this.namePool.appendChild(card);
    });
  }

  /* ---------- Подсветка результата ---------- */
  markResults(results) {
    results.forEach(({ slot, correct }) => {
      slot.classList.remove("correct", "wrong");
      slot.classList.add(correct ? "correct" : "wrong");
    });
  }

  /* ---------- Модалки ---------- */
  showResult(allOk, okCount, total) {
    this.resultGif.src = allOk ? "assets/cool.gif" : "assets/error.gif";
    this.resultTitle.textContent = allOk ? t("allCorrectTitle") : t("someWrongTitle");
    this.resultText.textContent = allOk
      ? t("allCorrectText")
      : `${t("someWrongText")} (${okCount}/${total})`;
    this.resultModal.classList.remove("hidden");
  }

  /* ---------- Подсказки ---------- */
  updateHint(pairs = [], mode = "setup") {
    const body = this.hintModal?.querySelector(".modal-body");
    if (!body) return;

    if (mode === "quiz" && pairs.length) {
      body.innerHTML = `
        ${t("modalHintBodyQuizIntro")}
        <ul style="list-style:none;padding-left:0;margin:8px 0;">
          ${pairs.map((p) => `<li>${p.emoji} — ${p.name}</li>`).join("")}
        </ul>
        ${t("modalHintBodyQuizOutro")}
      `;
    } else {
      body.innerHTML = t("modalHintBodySetup");
    }
  }
}
