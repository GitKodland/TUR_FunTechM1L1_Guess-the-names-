// === UNIVERSAL TRANSLATION FILE ===
// Just change the text values below — the app will update automatically.

export const TEXTS = {
  base: {
    appTitle: "İfadeye göre isimleri tahmin edin",
    openHint: "İpucu",
    win1Title: "Adım 1. İsimlerini girin ve ifadeleri seçin",
    win1Note: "İsimleri girin (10'dan daha az girebilirsiniz). Her ifade bir isme atanmıştır.",
    chooseEmoji: "Bir ifade seçin",
    hintTitle: "İpucu",
    hintText: "İsimleri girin ve karşılık gelecek ifadeler seçin. Sonrasında ifadelerden isimleri hatırlamaya çalışın.",
    accept: "Kabul Et",
    win2Title: "Adım 2. İsimleri ifadeler ile eşleştirin",
    check: "Kontrol Et",
    back: "Geri",
    close: "Kapat",
    dropHint: "Kartı tekrar buraya sürükleyin",
    allCorrectTitle: "Harika!",
    allCorrectText: "Tüm cevaplar doğru 🎉",
    needOnePair: "Lütfen, en azından bir ifade ile isim girin!!!",
    duplicateNames: "Her isim sadece bir kişiye ait olmalıdır 😊 Fazlalık varsa kontrol edin. Eğer aynı ismi taşıyan kişiler varsa, soyadlarının ilk harflerini ayrım yapmak için ekleyin!",
    someWrongTitle: "Yanlışlar var",
    someWrongText: "Kırmızı olanları kontrol edin. Doğru isimler yanlarında gösterilmiştir.",
    modalHintBodySetup: `
      İsimleri girin ve onlara ifadeler seçin.<br>
      Ardından, ikinci pencerede, isim kartlarını ifade resimlerine sürükleyin.
    `,
    modalHintBodyQuizIntro: `
      <p><b>İpucu:</b> İşte, başlangıçta yaptığınız girişler:</p>
    `,
    modalHintBodyQuizOutro: `
      <p style="font-size:14px;opacity:.7;">İsim kartlarını, karşılık gelen ifadelere sürükleyin.</p>
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
