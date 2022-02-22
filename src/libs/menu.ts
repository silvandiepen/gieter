import { blockLine, blockSettings, blockMid } from "cli-block";

import { makePath } from "./files";
import { Payload, MenuItem } from "../types";
import { getSVGData } from "./svg";

export const getMenuIcons = async (menu: MenuItem[]): Promise<MenuItem[]> => {
  return await Promise.all(
    menu.map(async (item) => {
      let icon = item.icon;

      if (icon && icon.includes(".svg")) {
        icon = await getSVGData(item.icon);
      }

      if (item.children) {
        item = {
          ...item,
          children: await getMenuIcons(item.children),
        };
      }
      return { ...item, icon: icon || "" };
    })
  );
};

export const generateMenu = async (payload: Payload): Promise<Payload> => {
  let menu: MenuItem[] = payload.files
    .map((file) => {
      let active = file.meta.hide !== "true" || !file.meta.hide;

      const relativePath = file.path.replace(process.cwd(), "");
      const pathGroup = relativePath.split("/");
      const depth = pathGroup.length - 2;

      // Only items from the main depth should be in the menu
      if (depth > 0) active = false;

      // Index in first depth can also be in menu
      if (depth === 1 && file.home) active = true;

      return {
        id: file.id,
        name: file.title,
        link: makePath(file),
        active,
        language: file.language,
        icon: file.meta.icon,
      };
    })
    .filter((item) => item.active);

  // Get Children of Articles

  menu.forEach((item) => {
    const file = payload.files.find((f) => f.id == item.id);

    if (file.meta.isArchive && file.meta.menuChildren) {
      const children = payload.files
        .filter((f) => f.parent == file.parent && !f.home)
        .map((c) => ({
          id: c.id,
          name: c.title,
          link: makePath(c),
          active: c.meta.hide !== true || !c.meta.hide,
          language: c.language,
          icon: c.meta.icon,
        }));

      item.children = children;
    }
  });

  menu = await getMenuIcons(menu);

  blockMid("Navigation");

  const menuItems = {};

  if (menu.length > 0) {
    if (menu.length == 1 && menu[0].link == "/index.html") {
      menu = [];
      blockLine("no menu to display");
    } else {
      menu.forEach((item) => {
        menuItems[item.name] = item.link;
      });
      await blockSettings(menuItems);
    }
  }

  return { ...payload, menu };
};
