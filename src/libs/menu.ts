import { blockLine, blockSettings, blockMid, blockLineError } from "cli-block";

import { getParentFile, makePath } from "./files";
import { Payload, MenuItem, ArchiveType, File } from "../types";
import { getSVGData } from "./svg";

export const getMenuIcons = async (menu: MenuItem[]): Promise<MenuItem[]> => {
  return await Promise.all(
    menu.map(async (item) => {
      let icon = item.icon;

      if (icon && icon.includes(".svg")) {
        icon = await getSVGData(item.icon);
        if (icon == "") {
          blockLineError(`${item.icon} doesnt exist`);
        }
      }

      if (item.children)
        item = {
          ...item,
          children: await getMenuIcons(item.children),
        };

      return { ...item, icon: icon || "" };
    })
  );
};

export const getLink = (file: File, payload: Payload): string => {
  const parent = getParentFile(file, payload.files);

  let link = "";

  if (
    parent?.meta &&
    parent.meta.archive &&
    parent.meta.archive == ArchiveType.SECTIONS
  ) {
    link = `${makePath(parent)}#${file.id}`;
  } else {
    link = makePath(file);
  }

  link = link.replace("index.html", "");

  if (payload.languages.length < 2) {
    return link.replace(`${payload.languages[0]}-`, ``);
  } else return link;
};

const toMenuItem = (file: File, payload: Payload): MenuItem => ({
  id: file.id,
  name: file.title,
  link: getLink(file, payload),
  active: file.meta.hide !== true || !file.meta.hide,
  language: file.language,
  icon: file.meta.icon,
  order: file.meta.order || 999,
});

const depth = (file: File): number =>
  (file.relativePath.match(/\//g) || []).length;

export const generateMenu = async (payload: Payload): Promise<Payload> => {
  let menu: MenuItem[] = payload.files
    .filter((f) => depth(f) === 1)
    .map((file) => {
      let active = file.meta.hide !== "true" || !file.meta.hide;

      const children = file.meta.menuChildren
        ? payload.files
            .filter((f) => depth(f) > 1)
            .filter((f) => f.parent.id == file.id)
            .map((f) => toMenuItem(f, payload))
            .filter((item) => item.active)
            .sort((a, b) => a.order - b.order)
        : [];

      return {
        ...toMenuItem(file, payload),
        children,
        active,
      };
    })
    .filter((item) => item.active)
    .sort((a, b) => a.order - b.order);

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
