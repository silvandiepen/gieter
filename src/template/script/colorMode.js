const isDarkMode = window.matchMedia("prefers-color-scheme: dark").matches;
let localMode = isDarkMode ? "dark" : "light";

function initColorMode() {
  localMode = localStorage.getItem("colorMode");
  setCurrentMode(localMode ? localMode : isDarkMode ? "dark" : "light");
}

function setCurrentMode(mode) {
  // Set current variable
  localMode = mode;
  // Set local Storage
  const colorMode = { mode: localMode };

  localStorage.setItem("colorMode", localMode);
  // Set body attribute
  document.body.setAttribute("color-mode", mode);
}

function switchMode() {
  console.log(`switching to ${localMode ? "darkMode" : "lightMode"}`);
  if (localMode == "dark") setCurrentMode("light");
  else setCurrentMode("dark");
}

initColorMode();
