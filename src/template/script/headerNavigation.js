const setHovers = () => {

  const navigationLinks = document.querySelectorAll(
    ".header .navigation__link"
  );

  let hovering = null;

  navigationLinks.forEach((link) => {
    link.addEventListener("mouseover", (e) => {
      if (hovering == link) return;
      const sizes = e.target.getBoundingClientRect();
      const navigation = document.querySelector(".header .navigation__list");
      const navigationSizes = navigation.getBoundingClientRect();

      const x = `${Math.round(sizes.left - navigationSizes.left)}px`;
      const w = `${Math.round(sizes.width)}px`;

      navigation.style.setProperty("--h-w", w);
      navigation.style.setProperty("--h-x", x);
      hovering = link;
    });
  });
};

const setCurrent = () => {
  const currentLink = document.querySelector(
    ".header .navigation__item--current"
  );

  if (!currentLink) return;

  const linkSize = currentLink.getBoundingClientRect();
  const navigation = document.querySelector(".header .navigation");
  const navigationSize = document
    .querySelector(".header .navigation__list")
    .getBoundingClientRect();

  console.log(currentLink, linkSize);

  const x = `${Math.round(linkSize.left - navigationSize.left)}px`;
  const w = `${Math.round(linkSize.width)}px`;
  navigation.style.setProperty("--x", x);
  navigation.style.setProperty("--w", w);
  navigation.setAttribute("data-x", x);
  navigation.setAttribute("data-w", w);
};

const initNavigation = () => {
  setHovers();
  setCurrent();
};
initNavigation();
