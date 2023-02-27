import { blockLine, blockSettings, blockMid } from "cli-block";

import { getParentFile, makePath } from "@/libs/files";
import { Payload, MenuItem, ArchiveType } from "@/types";
import { getSVGData } from "@/libs/svg";

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

const filterHomePage = (payload: Payload, item: MenuItem) => {
  const langUrls = [
    "/index.html",
    ...payload.languages.map((l) => `/${l}/index.html`),
  ];

  return !langUrls.includes(item.link);
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

      const parent = getParentFile(file, payload.files);

      let link = "";

      if (
        parent?.meta &&
        parent.meta.archive &&
        parent.meta.archive == ArchiveType.SECTIONS
      ) {
        link = `/#${file.id}`;
      } else {
        link = makePath(file);
      }

      return {
        id: file.id,
        name: file.title,
        link: link,
        active,
        language: file.language,
        icon: file.meta.icon,
        order: file.meta.order || 999,
      };
    })
    .filter((item) => filterHomePage(payload, item))
    .filter((item) => item.active)
    .sort((a, b) => a.order - b.order);

  // Get Children of Articles

  menu.forEach((item) => {
    const file = payload.files.find((f) => f.id == item.id);

    if (!!file.meta.archive && file.meta.menuChildren) {
      const children = payload.files
        .filter((f) => f.parent == file.parent && !f.home)
        .map((c) => ({
          id: c.id,
          name: c.title,
          link: makePath(c),
          active: c.meta.hide !== true || !c.meta.hide,
          language: c.language,
          icon: c.meta.icon,
          order: c.meta.order || 999,
        }))
        .sort((a, b) => a.order - b.order);

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
