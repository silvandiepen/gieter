function waiter(ms = 2000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(10);
    }, ms);
  });
}

const linkAction = async (link) => {
  console.log(link);
  try {
    if (!link || link.includes("http")) return;

    const doc = await fetch(link)
      .then((response) => {
        return response.text();
      })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        return doc;
      });

    doc
      .querySelector("body")
      .setAttribute(
        "color-mode",
        document.querySelector("body").getAttribute("color-mode")
      );

    loadInline(doc);

    window.history.pushState(
      { page: "another" },
      "another page",
      link.replace("/index.html", "")
    );

    doc.body.classList.add("coming-in");
    document.body.classList.add("going-away");

    await waiter(500);

    setTimeout(() => {
      document.body.classList.remove("coming-in");
    }, 500);

    document.title = doc.title;
    document.body = doc.body;

    setTimeout(() => {
      window.scrollTo(0, 0);
      findWebComponents();
      stickyNav();
    });
  } catch (err) {}
};

const loadInline = (d) => {
  const links = d.querySelectorAll(".navigation a");
  links.forEach((link) => {
    link.setAttribute("is-inline", true);
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      linkAction(link.getAttribute('href'));
    });
  });
};

loadInline(document);
