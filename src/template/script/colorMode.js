const isDarkMode = window.matchMedia("prefers-color-scheme: dark").matches;
let localMode = isDarkMode ? "dark" : "light";

const initColorMode = () => {
  localMode = localStorage.getItem("colorMode");
  setCurrentMode(localMode ? localMode : isDarkMode ? "dark" : "light");
};

const setCurrentMode = (mode) => {
  localMode = mode;
  localStorage.setItem("colorMode", localMode);
  document.body.setAttribute("color-mode", mode);
};

const switchMode = () => {
  console.log(`switching to ${localMode ? "darkMode" : "lightMode"}`);
  if (localMode == "dark") setCurrentMode("light");
  else setCurrentMode("dark");
};

initColorMode();
