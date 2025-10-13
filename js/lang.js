// === UNIVERSAL TRANSLATION FILE ===
// Just change the text values below — the app will update automatically.

export const TEXTS = {
  base: {
    appTitle: "Guess the Names by Emoji",
    openHint: "Hint",
    win1Title: "Step 1. Enter names and choose emojis",
    win1Note: "Enter names (you can use fewer than 10). Each emoji will be linked to a name.",
    chooseEmoji: "Choose an emoji",
    hintTitle: "Hint",
    hintText: "Enter names and assign an emoji to each. Then try to remember the names by emojis.",
    accept: "Accept",
    win2Title: "Step 2. Match names to emojis",
    check: "Check",
    back: "Back",
    close: "Close",
    allCorrectTitle: "Awesome!",
    allCorrectText: "All answers are correct 🎉",
    someWrongTitle: "There are mistakes",
    someWrongText: "Check the highlighted rows. Correct names are shown next to them.",
    modalHintBodySetup: `
      Enter names and assign emojis to them.<br>
      Then, in the second window, drag and drop name cards onto the matching emojis.
    `,
    modalHintBodyQuizIntro: `
      <p><b>Hint:</b> here’s what you entered earlier:</p>
    `,
    modalHintBodyQuizOutro: `
      <p style="font-size:14px;opacity:.7;">Drag each name card to the matching emoji.</p>
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
