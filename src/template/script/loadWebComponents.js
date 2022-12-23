const getAllTagMatches = (regEx) =>
  Array.prototype.slice
    .call(document.querySelectorAll("*"))
    .filter(function (el) {
      return el.tagName.match(regEx);
    });

const findWebComponents = () => {
  const components = getAllTagMatches(/^sil-/i).map(
    (c) => (c = c.tagName.toLowerCase().replace("sil-", ""))
  );

  components.forEach((c) => {
    console.log(`loading sil-${c}`);
    const head = document.getElementsByTagName("head").item(0);
    const script = document.createElement("script");
    script.setAttribute("type", "module");
    script.setAttribute("src", `https://unpkg.com/@sil/ui/dist/${c}.js`);
    head.appendChild(script);
  });
};

findWebComponents();
