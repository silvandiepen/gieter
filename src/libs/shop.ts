import { blockLineWarning, blockMid, blockSettings } from "cli-block";
import { Payload, File, Currency, ArchiveType, Shop } from "../types";

export const getShopCurrency = async (
  payload: Payload
): Promise<Currency | null> => {
  let currency: Currency;

  const currencyFile = payload.files.filter((file) => !!file.meta.currency);

  if (currencyFile.length) {
    if (currencyFile.length > 1) {
      blockLineWarning(
        `Multiple currencies has been defined. ${currencyFile[0].meta.currency} will be used`
      );
    }
    currency = currencyFile[0].meta.currency.toLowerCase();
  }

  if (currency) blockSettings({ currency: currency.toUpperCase() });

  return currency;
};

export const getShopHas = (payload: Payload): Payload => {
  const hasShop =
    payload.files.findIndex(
      (file: File) => file.meta.archive == ArchiveType.SHOP
    ) > -1;

  const hasPaypal =
    payload.files.findIndex((file: File) => file.meta.paypal) > -1;

  return {
    ...payload,
    has: {
      paypal: hasPaypal,
      shop: hasShop,
    },
  };
};

export const paymentClientId = (payload: Payload): string => {
  if (payload.has.paypal) {
    const paypalId = payload.files.find((file: File) => file.meta.paypal);
    return paypalId.meta.paypal;
  }
  return "";
};

export const generateShop = async (payload: Payload): Promise<Payload> => {
  const currency = await getShopCurrency(payload);

  payload = getShopHas(payload);

  if (!payload.has.shop || !currency) return payload;

  blockMid("Shop");

  // payload.files.forEach((file: File) => {
  //   // if (file.meta.price) console.log(file);
  // });

  const shop: Shop = {
    currency,
    clientId: paymentClientId(payload),
  };

  return { ...payload, shop };
};
