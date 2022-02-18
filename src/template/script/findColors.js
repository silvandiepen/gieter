const container = document.querySelector(".container").querySelectorAll("*");

console.log(container);

container.forEach((el) => {
  const text = el.innerText;
  if (el.innerHTML == el.textContent)
    if (text) {
      const matches = text.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/i);
      if (matches) {
        console.log("-----");
        console.log(matches);
        console.log(el.innerHTML);

        el.innerHTML = el.innerHTML.replace(
          matches[0],
          `<span class="color-preview" style="--color-preview:${matches[0]}">${matches[0]}</span>`
        );
      }
    }
});
