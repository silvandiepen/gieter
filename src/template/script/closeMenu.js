const menuItems = document.querySelectorAll(".navigation__link");
const menuInput = document.querySelector(".navigation__input");

menuItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (window.innerWidth < 1024) {
      //   console.log("clicked item");
      menuInput.checked = false;
    }
  });
});
