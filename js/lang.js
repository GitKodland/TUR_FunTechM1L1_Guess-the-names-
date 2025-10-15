// === UNIVERSAL TRANSLATION FILE ===
// Just change the text values below — the app will update automatically.

export const TEXTS = {
  base: {
    appTitle: "Guess the names based on emoji",
    openHint: "Hint",
    win1Title: "Step 1. Enter names and choose emojis",
    win1Note: "Enter names (you can enter fewer than 10). Each emoji is assigned to a name.",
    chooseEmoji: "Choose an emoji",
    hintTitle: "Hint",
    hintText: "Enter names and choose emojis for them. Then try to recall the names from the emojis.",
    accept: "Accept",
    win2Title: "Step 2. Match the names to the emojis",
    check: "Check",
    back: "Back",
    close: "Close",
    dropHint: "Drag the card back here",
    allCorrectTitle: "Cool!",
    allCorrectText: "All answers are correct 🎉",
    needOnePair: "Please, enter at least one name with emoji!!!",
    duplicateNames: "Each name should belong to only one person 😊 Check if there are any duplicates. If there are namesakes, add the first letter of the surname to tell them apart!",
    someWrongTitle: "There are mistakes",
    someWrongText: "Check the highlighted rows. The correct names are shown next to them.",
    modalHintBodySetup: `
      Enter names and choose emojis for them.<br>
      Then, in the second window, drag the name cards to the emoji pictures.
    `,
    modalHintBodyQuizIntro: `
      <p><b>Hint:</b> here’s what you entered at the start:</p>
    `,
    modalHintBodyQuizOutro: `
      <p style="font-size:14px;opacity:.7;">Drag the name card to the corresponding emoji.</p>
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
