const SHOP_CONST = {
  LOADED: "gtr:shop:loaded",
  LOCAL_CHECKOUT: "gtr:shop:checkout",
};

function initPayPalButton() {
  paypal
    .Buttons({
      style: {
        shape: "pill",
        color: "blue",
        layout: "horizontal",
        label: "pay",
      },

      createOrder: function (data, actions) {
        const orderData = JSON.parse(
          localStorage.getItem(SHOP_CONST.LOCAL_CHECKOUT)
        );

        if (orderData && orderData.value > 0 && orderData.currency_code)
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  ...orderData,
                },
              },
            ],
          });
      },

      onApprove: function (data, actions) {
        return actions.order.capture().then(function (orderData) {
          // Full available details
          console.log(
            "Capture result",
            orderData,
            JSON.stringify(orderData, null, 2)
          );

          // Show a success message within this page, e.g.
          const element = document.querySelector("#paypal-button-container");
          element.innerHTML = "";
          element.innerHTML = "<h3>Thank you for your payment!</h3>";

          // Or go to another URL:  actions.redirect('thank_you.html');
        });
      },

      onError: function (err) {
        console.log(err);
      },
    })
    .render("#paypal-button-container");
}
document.addEventListener(SHOP_CONST.LOADED, () => {
  initPayPalButton();
});
