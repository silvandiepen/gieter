const getAllTagMatches = (regEx) =>
  Array.prototype.slice
    .call(document.querySelectorAll("*"))
    .filter(function (el) {
      return el.tagName.match(regEx);
    });

const findWebComponents = () => {
  const components = [
    ...new Set(
      getAllTagMatches(/^sil-/i).map(
        (c) => (c = c.tagName.toLowerCase().replace("sil-", ""))
      )
    ),
  ];

  const scripts = [...document.querySelectorAll("script")].map(
    (script) => script.src
  );

  components.forEach((c) => {
    const url = `https://load.ui.sil.mt/${c}.js`;
    if(scripts.includes(url)) return;

    console.log(`loading sil-${c}`);
    const head = document.getElementsByTagName("head").item(0);
    const script = document.createElement("script");
    script.setAttribute("type", "module");
    script.setAttribute("src", url);
    head.appendChild(script);
  });
};

findWebComponents();
