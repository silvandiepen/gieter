const getAllTagMatches = (regEx) =>
  Array.prototype.slice
    .call(document.querySelectorAll("*"))
    .filter(function (el) {
      return el.tagName.match(regEx);
    });

const findWebComponents = () => {
  console.log("initialized find web components");
  const components = [
    ...new Set(
      getAllTagMatches(/^sil-/i).map(
        (c) => (c = c.tagName.toLowerCase().replace("sil-", ""))
      )
    ),
  ];

  // const scriptsUrls = [...document.querySelectorAll("script")].map(
  //   (script) => script.src
  // );
  const scripts = document.querySelectorAll("script");

  components.forEach((c) => {
    const url = `https://load.ui.sil.mt/${c}.js`;


    const findCurrent = [...scripts].find((script) => script.src == url);
    if (findCurrent) findCurrent.remove();

    console.log(`loading sil-${c}`);
    const head = document.getElementsByTagName("head").item(0);
    const script = document.createElement("script");
    script.setAttribute("type", "module");
    script.setAttribute("src", url);
    head.appendChild(script);
  });
};
