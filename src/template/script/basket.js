import {
  createApp,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watchEffect,
  computed,
} from "vue";

const SHOP_CONST = {
  LOCAL_BASKET: "gtr:shop:basket",
  LOCAL_CHECKOUT: "gtr:shop:checkout",
  BASKET_TOGGLE: "gtr:shop:basket:toggle",
  LOADED: "gtr:shop:loaded",
};

const state = reactive({
  items: [],
  checkout: {
    value: 0,
    currency_code: "EUR",
  },
  settings: {
    currency: "EUR",
    language: "en-EN",
  },
});

const useBasket = () => {
  const createNewItem = (item) => {
    const basketItem = {
      id: item.id,
      name: item.name,
      title: item.title,
      meta: item.meta,
      language: item.language,
      type: item.type,
      thumbnail: item.thumbnail,
      thumbnailSvg: item.thumbnailSvg,
      amount: 1,
      price: item.meta.price,
    };
    return basketItem;
  };

  const addToBasket = (item) => {
    const existingItem = state.items.find((i) => i.id == item.id);
    if (existingItem) {
      setItemAmount(existingItem.id, parseInt(existingItem.amount) + 1);
      setItems();
      return;
    }
    state.items.push(createNewItem(item));
    setItems();
  };

  const getItems = () => {
    const items = localStorage.getItem(SHOP_CONST.LOCAL_BASKET);
    if (items) state.items = items ? JSON.parse(items) : [];
  };

  const setItems = () => {
    localStorage.setItem(SHOP_CONST.LOCAL_BASKET, JSON.stringify(state.items));
    setCheckoutDetails();
    getItems();
  };

  const setCheckoutDetails = () => {
    state.checkout.value = totalPrice.value;
    state.checkout.currency = state.settings.currency;
    saveCheckout();
  };
  const saveCheckout = () => {
    localStorage.setItem(
      SHOP_CONST.LOCAL_CHECKOUT,
      JSON.stringify(state.checkout)
    );
  };

  const removeItem = (id) => {
    state.items = state.items.filter((item) => item.id !== id);
    setItems();
  };

  const setItemAmount = (id, amount) => {
    if (amount < 1) amount = 0;

    const index = state.items.findIndex((item) => item.id == id);
    state.items[index].amount = amount;
    setItems();
  };

  const totalAmount = computed(() =>
    state.items.reduce((accum, item) => {
      return accum
        ? parseInt(accum) + parseInt(item.amount) || 0
        : parseInt(accum) + parseInt(item.amount) || 0;
    }, 0)
  );

  const settings = computed(() => {
    return state.settings;
  });

  const totalPrice = computed(() => {
    if (!state.items.length) return 0;

    return state.items.reduce((accum, item) => {
      return accum
        ? accum + (item.price * item.amount || 0)
        : item.price * item.amount || 0;
    }, 0);
  });

  const items = computed(() => {
    return state.items;
  });

  const formatPrice = (price) =>
    new Intl.NumberFormat(settings.value.language, {
      style: "currency",
      currency: settings.value.currency,
    }).format(price);

  return {
    setItems,
    getItems,
    removeItem,
    addToBasket,
    setItemAmount,
    formatPrice,
    state,
    items,
    settings,
    totalAmount,
    totalPrice,
  };
};

const BasketComponent = defineComponent({
  template: `
    <div class="basket" v-show="active && items.length > 0">
        <ul class="basket__list">
            <li class="basket__item" v-for="(item,index) in items" :key="index">
                <figure v-if="item.thumbnailSvg" v-html="item.thumbnailSvg"></figure>    
                <div class="basket__content">
                    <input class="basket__amount" @change="updateAmount(item.id, $event.target.value)" type="number" v-model="item.amount" />
                    <h4 class="basket__title">{{ item.title }}</h4>
                    <span class="basket__price" class="basket__price" v-if="item.price">{{formatPrice(item.price * item.amount)}}</span>
                    <button class="basket__delete" @click="removeItem(item.id)">
                        <span class="icon icon--delete"></span>
                    </button>
                </div>
            </li>
        </ul>
        <div class="basket__footer">
            <div class="basket__total">
               total: {{formatPrice(totalPrice)}}
            </div>

            <div id="paypal-button-container"></div>
      
            
        </div>
    </div>
  `,
  setup() {
    const active = ref(false);
    const button = ref(null);

    const {
      items,
      totalPrice,
      removeItem,
      setItemAmount,
      settings,
      formatPrice,
    } = useBasket();

    const updateAmount = (id, amount) => {
      setItemAmount(id, amount);
    };

    const activateButton = () => {
      let i = 0;
      const loadButton = setInterval(() => {
        button.value = document.querySelectorAll("#basket");

        if (button.value) {
          button.value.forEach((btn) => {
            btn.addEventListener("click", () => {
              const event = new Event(SHOP_CONST.BASKET_TOGGLE);
              document.dispatchEvent(event);
            });
          });
        }
        if (i === 10 || button.value) clearInterval(loadButton);
        i++;
      }, 1000);
    };
    const wrapper = ref();

    watchEffect(() => {
      if (wrapper.value)
        if (active.value) {
          wrapper.value.classList.add("reveal");
        } else {
          wrapper.value.classList.remove("reveal");
        }
    });

    onMounted(() => {
      activateButton();

      wrapper.value = document.querySelector(".wrapper");

      const loadedEvent = new Event(SHOP_CONST.LOADED);
      document.dispatchEvent(loadedEvent);

      document.addEventListener(
        SHOP_CONST.BASKET_TOGGLE,
        (args) => {
          active.value = !active.value;
        },
        false
      );
    });

    return { active, items, removeItem, totalPrice, updateAmount, formatPrice };
  },
});

createApp({
  delimiters: ["[[", "]]"],
  components: {
    Basket: BasketComponent,
  },
  setup() {
    const { getItems, addToBasket, totalAmount, formatPrice } = useBasket();

    onMounted(() => {
      getItems();
    });

    return {
      formatPrice,
      addToBasket,
      totalAmount,
    };
  },
}).mount("#app");
