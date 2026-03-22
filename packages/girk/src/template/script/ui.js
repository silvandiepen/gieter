const setNavigationOpen = (isOpen) => {
  document.body.classList.toggle("nav-open", isOpen);

  const toggle = document.querySelector(".navigation-toggle");
  if (toggle) {
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
};

const initUi = () => {
  const toggle = document.querySelector(".navigation-toggle");
  const overlay = document.querySelector(".navigation__background");
  const navLinks = document.querySelectorAll(".header .navigation__link");

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    setNavigationOpen(!document.body.classList.contains("nav-open"));
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      setNavigationOpen(false);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setNavigationOpen(false);
    });
  });
};

initUi();
