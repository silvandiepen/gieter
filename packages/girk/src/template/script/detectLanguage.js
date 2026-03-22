const languageElements = document.querySelectorAll(".language__item");
const languages = [];

const getBrowserLanguage = () => {
  const language = window.navigator.userLanguage || window.navigator.language;

  if (language.includes("-")) return language.split("-")[0];

  return language;
};

const getCurrentLanguage = () => {
  const local = localStorage.getItem("currentLanguage");
  const language = document.documentElement.lang;
  return local || language;
};

languageElements.forEach((l) => {
  const link = l.querySelector(".language__link");
  languages.push({
    element: l,
    code: link.getAttribute("data-code"),
    title: link.getAttribute("data-title"),
    name: link.getAttribute("data-name"),
    link: link.getAttribute("href"),
  });
});

const setLanguage = () => {
  // If there is only one language, it doesn't make sense.
  if (Object.keys(languages).length < 2) return;
  
  // If the current language, is already the prefered language.
  if (getBrowserLanguage() == getCurrentLanguage()) return;

  // Check if the prefered language, exists in our list.
  const lang = languages.find((l) => l.code == getBrowserLanguage());

  if (lang) window.location.replace(`${window.location.origin}${lang.link}`);

  return;
};

const setLocalLanguage = (code) => {
  localStorage.setItem("language", code);
};

const init = () => {
  languages.forEach((lang) => {
    lang.element.addEventListener("click", (e) => {
      setLocalLanguage(lang.code);
    });
  });
};

init();
