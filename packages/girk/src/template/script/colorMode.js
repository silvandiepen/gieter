const isDarkMode = window.matchMedia("prefers-color-scheme: dark").matches;
let localMode = isDarkMode ? "dark" : "light";

const updateColorModeToggle = () => {
  const toggle = document.querySelector("[data-color-mode-toggle]");
  if (!toggle) return;

  const value = toggle.querySelector(".color-mode-toggle__value");
  if (!value) return;

  value.textContent = localMode === "dark" ? "Dark" : "Light";
};

const initColorMode = () => {
  localMode = localStorage.getItem("colorMode");
  setCurrentMode(localMode ? localMode : isDarkMode ? "dark" : "light");
};

const setCurrentMode = (mode) => {
  localMode = mode;
  localStorage.setItem("colorMode", localMode);
  document.body.setAttribute("color-mode", mode);
  updateColorModeToggle();
};

const switchMode = () => {
  if (localMode == "dark") setCurrentMode("light");
  else setCurrentMode("dark");
};

const bindColorModeToggle = () => {
  const toggle = document.querySelector("[data-color-mode-toggle]");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    switchMode();
  });
};

initColorMode();
bindColorModeToggle();
