const tables = document.querySelectorAll("table");
let initTableWrap = false;

const wrapTables = (tables) => {
  tables &&
    tables.forEach((table) => {
      if (table.getBoundingClientRect().width > window.screen.width) {
        table.classList.add("wrap");
        initTableWrap = true;
      }
    });
};

const labelTables = (tables) => {
  tables &&
    tables.forEach((table) => {
      // Set all headers as attributes to td's
      const headerElements = table.querySelectorAll("thead th");
      const bodyElementRows = table.querySelectorAll("tbody tr");
      const heads = [];

      if (headerElements && bodyElementRows) {
        // Get TH heads
        headerElements.forEach((th) => {
          heads.push(th.textContent);
        });
      }

      if (heads.length) {
        bodyElementRows.forEach((tr) => {
          const tds = tr.querySelectorAll("td");

          tds.forEach((td, i) => {
            td.setAttribute("data-label", heads[i]);
          });
        });
      }
    });
};

wrapTables(tables);
labelTables(tables);

window.addEventListener("resize", () => {
  if (!initTableWrap) wrapTables(tables);
});
