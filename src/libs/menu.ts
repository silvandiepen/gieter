import * as log from "cli-block";

import { makePath } from "./files";
import { Payload } from "../types";

export const generateMenu = async (payload: Payload): Promise<Payload> => {
  let menu = payload.files
    .map((file) => {
      let active = file.meta.hide !== "true" || file.meta.hide;

      const relativePath = file.path.replace(process.cwd(), "");
      const pathGroup = relativePath.split("/");
      const depth = pathGroup.length - 2;

      // Only items from the main depth should be in the menu
      if (depth > 0) active = false;

      // Index in first depth can also be in menu
      if (depth === 1 && file.home) active = true;

      return {
        name: file.title,
        link: makePath(file),
        active,
        language: file.language,
      };
    })
    .filter((item) => item.active);

  log.BLOCK_MID("Navigation");

  const menuItems = {};
  if (menu.length > 1)
    menu.forEach((item) => {
      menuItems[item.name] = item.link;
    });

  if (menu.length < 2) {
    await log.BLOCK_LINE("No menu");
    menu = [];
  } else await log.BLOCK_SETTINGS(menuItems);

  return { ...payload, menu };
};
