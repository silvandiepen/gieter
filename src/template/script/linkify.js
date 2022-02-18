const urlTokens = document.querySelectorAll(".token.url");

urlTokens.forEach((token) => {
  if (token.innerHTML == token.textContent) {
    const text = token.textContent;

    if (text.includes("http")) {
      const link = document.createElement("a");
      link.setAttribute("href", text);
      link.innerText = text;

      token.parentNode.replaceChild(link, token);
    }
  }
});
