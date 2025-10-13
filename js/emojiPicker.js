const EMOJIS = [
  "🦊", "🐻", "🐱", "🐶", "🤖", "🛸", "🎨", "⚽", "🎸",
  "🎮","🚀", "🎧", "💐", "🪞", "🐰"
];

export class EmojiPicker {
  constructor({gridEl, modalEl, onSelect, onClose}) {
    this.gridEl = gridEl;
    this.modalEl = modalEl;
    this.onSelect = onSelect;
    this.onClose = onClose;
    this.selected = new Set();
    this._render();
    this._bind();
  }

  _render() {
    this.gridEl.innerHTML = "";
    EMOJIS.forEach(emo => {
      const btn = document.createElement("button");
      btn.className = "emoji-item";
      btn.textContent = emo;
      btn.dataset.emoji = emo;
      btn.addEventListener("click", () => {
        if (btn.classList.contains("disabled")) return;
        this.onSelect?.(emo);
        this.hide();
      });
      this.gridEl.appendChild(btn);
    });
  }

  _bind() {
    this.modalEl.addEventListener("click", e => {
      if (e.target === this.modalEl) this.hide();
    });
    document.getElementById("emojiClose").addEventListener("click", () => this.hide());
  }

  updateDisabled() {
    this.gridEl.querySelectorAll(".emoji-item").forEach(btn => {
      const emo = btn.dataset.emoji;
      btn.classList.toggle("disabled", this.selected.has(emo));
    });
  }

  markUsed(emoji) { this.selected.add(emoji); this.updateDisabled(); }
  unmarkUsed(emoji) { this.selected.delete(emoji); this.updateDisabled(); }

  show() { this.updateDisabled(); this.modalEl.classList.remove("hidden"); }
  hide() { this.modalEl.classList.add("hidden"); this.onClose?.(); }
}
