const container = document.querySelector(".container").querySelectorAll("*");

container.forEach((el) => {
  const text = el.innerText;
  if (el.innerHTML == el.textContent)
    if (text) {
      const matches = text.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/i);
      if (matches) {
        el.innerHTML = el.innerHTML.replace(
          matches[0],
          `<span class="color-preview" style="--color-preview:${matches[0]}">${matches[0]}</span>`
        );
      }
    }
});
