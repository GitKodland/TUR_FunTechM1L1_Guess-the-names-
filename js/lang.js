// === UNIVERSAL TRANSLATION FILE ===
// Just change the text values below — the app will update automatically.

export const TEXTS = {
  base: {
    appTitle: "Угадай имена по эмодзи",
    openHint: "Подсказка",
    win1Title: "Шаг 1. Введите имена и выберите эмодзи",
    win1Note: "Введите имена (можно меньше 10). Эмодзи закрепляется за именем.",
    chooseEmoji: "Выберите эмодзи",
    hintTitle: "Подсказка",
    hintText: "Введите имена и выберите для них эмодзи. Затем попробуйте вспомнить имена по эмодзи.",
    accept: "Принять",
    win2Title: "Шаг 2. Сопоставьте имена по эмодзи",
    check: "Проверить",
    back: "Назад",
    close: "Закрыть",
    allCorrectTitle: "Круто!",
    allCorrectText: "Все ответы верные 🎉",
    someWrongTitle: "Есть ошибки",
    someWrongText: "Проверьте подсвеченные строки. Правильные имена показаны рядом.",
    modalHintBodySetup: `
      Введите имена и выберите для них эмодзи.<br>
      Затем, во втором окне, перетаскивайте карточки имён к картинкам-эмодзи.
    `,
    modalHintBodyQuizIntro: `
      <p><b>Подсказка:</b> вот, что вы вводили в начале:</p>
    `,
    modalHintBodyQuizOutro: `
      <p style="font-size:14px;opacity:.7;">Перетащи карточку с именем к соответствующему эмодзи.</p>
    `,
  },
};




// === UNIVERSAL LANGUAGE ENGINE ===
// It doesn't care what the key name is — ru/pl/en/base all work.
let currentLang = Object.keys(TEXTS)[0]; // auto-pick first key

export const t = (key) => TEXTS[currentLang]?.[key] ?? key;

export function applyTranslations() {
  // Set HTML lang attr
  document.documentElement.setAttribute("lang", currentLang);

  // Apply texts to all elements with [data-i18n]
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const text = TEXTS[currentLang][key];
    if (text === undefined) return;

    if (el.tagName.toLowerCase() === "input" && el.placeholder) {
      el.placeholder = text;
    } else {
      el.innerHTML = text; // allow <br> and HTML
    }
  });

  document.title = t("appTitle");
}

export function getTranslations() {
  return TEXTS[currentLang];
}
