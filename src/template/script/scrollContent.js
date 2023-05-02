(() => {
  const sections = document.querySelectorAll(".section .container");

  const onScroll = () => {
    console.log(sections);

    sections.forEach(() => {});
  };

  document.addEventListener("scroll", () => {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });

      ticking = true;
    }
  });
})();
