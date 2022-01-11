const navigation = document.querySelector(".navigation");
let ticking = false;
let lastScrollPosition = 0;

const setActiveNavigation = (scrollPosition) => {
  if (lastScrollPosition > scrollPosition || scrollPosition < 10) {
    navigation.classList.add("navigation--show");
    navigation.classList.remove("navigation--hide");
  } else {
    navigation.classList.add("navigation--hide");
    navigation.classList.remove("navigation--show");
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
