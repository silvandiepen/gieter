function waiter(ms = 2000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(10);
    }, ms);
  });
}

const linkAction = async (link) => {
  try {
    if (!link || link.includes("http")) return;

    const newDoc = await fetch(link)
      .then((response) => {
        return response.text();
      })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return doc;
      });

    newDoc
      .querySelector("body")
      .setAttribute(
        "color-mode",
        document.querySelector("body").getAttribute("color-mode")
      );

      // Setup for the next click
    loadInline(newDoc);

    window.history.pushState(
      { page: "another" },
      "another page",
      link.replace("/index.html", "")
    );

    const oldDoc = document;

    newDoc.body.classList.add("coming-in");
    oldDoc.body.classList.add("going-away");

    await waiter(500);

    setCurrent();

    setTimeout(() => {
      oldDoc.body.classList.remove("coming-in");
    }, 500);

    // Navigation Specific

    newDoc.querySelector(".header .navigation").style = oldDoc.querySelector(
      ".header .navigation"
    ).style;

    const oldNav = oldDoc.querySelector(".header .navigation");
    const newNav = newDoc.querySelector(".header .navigation");
    // console.log(oldNav, oldNav.getAttribute('data-x'), oldNav.getAttribute('data-w'), oldNav.style);

    const o_w = oldNav.getAttribute("data-w");
    const o_x = oldNav.getAttribute("data-x");

    newNav.setAttribute("data-w", o_w);
    newNav.setAttribute("data-x", o_x);
    newNav.style.setProperty("--w", o_w);
    newNav.style.setProperty("--x", o_x);

    // Replace new content

    setTimeout(() => {
      oldDoc.title = newDoc.title;
      oldDoc.body = newDoc.body;

      setTimeout(() => {
        window.scrollTo(0, 0);
        findWebComponents();
        stickyNav();
        initNavigation();
      });
    });
  } catch (err) {}
};

const loadInline = (d) => {
  const links = d.querySelectorAll(".navigation a");
  links.forEach((link) => {
    link.setAttribute("is-inline", true);
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      linkAction(link.getAttribute("href"));
    });
  });
};

loadInline(document);
