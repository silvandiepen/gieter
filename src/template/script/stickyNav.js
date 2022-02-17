const navigation = document.querySelector(".header__container");
let ticking = false;
let lastScrollPosition = 0;

const setActiveNavigation = (scrollPosition) => {
  if (scrollPosition < 10) {
    navigation.classList.add("header__container--on-top");
    navigation.classList.remove("header__container--off-top");
  } else {
    navigation.classList.remove("header__container--on-top");
    navigation.classList.add("header__container--off-top");
  }
  if (lastScrollPosition > scrollPosition || scrollPosition < 10) {
    navigation.classList.add("header__container--show");
    navigation.classList.remove("header__container--hide");
  } else {
    navigation.classList.add("header__container--hide");
    navigation.classList.remove("header__container--show");
  }
  lastScrollPosition = scrollPosition;
};

document.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      setActiveNavigation(window.scrollY);
      ticking = false;
    });
    ticking = true;
  }
});
