const { writeFile } = require("fs").promises;

import { join } from "path";
import { blockLine, blockLineSuccess } from "cli-block";

import { Payload, File, Page, buildHtmlArgs, MenuItem } from "../types";
import { getLanguageMenu, defaultLanguage } from "../libs/language";
import { makePath, buildHtml, getParentFile } from "./files";

import { createDir } from "@sil/tools/dist/lib/system";
import { createCss } from "./style";
import kleur from "kleur";
import { getSVGData } from "./svg";
import { getThumbnail } from "./media";

const simplifyUrl = (url: string): string => url.replace("/index.html", "");

const isActiveMenu = (link: string, current: string): boolean =>
  simplifyUrl(link) == simplifyUrl(current);

const isActiveMenuParent = (link: string, current: string): boolean =>
  simplifyUrl(current).includes(simplifyUrl(link)) &&
  simplifyUrl(current) !== "" &&
  simplifyUrl(link) !== "";

export const buildPage = async (
  payload: Payload,
  file: File
): Promise<Page> => {
  const currentLink = makePath(file);
  const currentLanguage = file.language;

  /*
   * Generate the html for this page
   */

  const menuStatus = (menu: MenuItem[]): MenuItem[] => {
    if (menu) {
      return menu
        .map((item) => ({
          ...item,
          current: isActiveMenu(item.link, currentLink),
          isParent: isActiveMenuParent(item.link, currentLink),
          children: menuStatus(item.children),
        }))
        .filter((item) => item.language == currentLanguage);
    } else {
      return [];
    }
  };

  const menu = payload.menu ? menuStatus(payload.menu) : [];

  const tags = payload.tags
    ? payload.tags.filter((tag) => tag.parent == file.parent)
    : [];

  const thumbnail = getThumbnail(file);

  const hasTable = () => file.html && file.html.includes("<table>");

  const hasUrlToken = () =>
    file.html && file.html.includes('<span class="token url">http');

  const hasHeader = () => menu.length > 0;

  const hasColors = () =>
    file.html && !!file.html.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/i);

  const subtitle = (): string => {
    const parent = getParentFile(file, payload.files);
    return parent?.title || "";
  };

  const data: buildHtmlArgs = {
    menu,
    tags,
    thumbnail,
    style: { ...payload.style, page: currentLink.replace(".html", ".css") },
    project: payload.project,
    media: payload.media,
    favicon: payload.favicon,
    meta: file.meta,
    contentOnly: false,
    showContentImage: file.meta?.image && file.meta.type !== "photo",
    homeLink: file.language == defaultLanguage ? "/" : `/${file.language}`,
    langMenu: getLanguageMenu(payload, file),
    language: currentLanguage,
    subtitle: subtitle(),
    has: {
      table: hasTable(),
      header: hasHeader(),
      urlToken: hasUrlToken(),
      colors: hasColors(),
    },
  };

  const html = await buildHtml(file, data);

  /*
   * Generate the custom CSS for this page
   */
  const customCssFilePath = join(payload.settings.output, currentLink).replace(
    ".html",
    ".css"
  );
  const customHtml = await buildHtml(
    file,
    {
      ...data,
      contentOnly: true,
    },
    "template/content.pug"
  );

  const customCss = await createCss(customHtml, payload.style.og);

  /*
   * Return the page
   */
  return {
    dir: join(
      payload.settings.output,
      currentLink.split("/").slice(0, -1).join("/")
    ),
    css: {
      data: customCss,
      file: customCssFilePath,
    },
    html: {
      data: html,
      file: join(payload.settings.output, currentLink),
    },
    name: file.name,
    link: currentLink,
  };
};

export const createPage = async (
  payload: Payload,
  file: File
): Promise<void> => {
  const page = await buildPage(payload, file);

  await createDir(page.dir);
  try {
    await writeFile(page.html.file, page.html.data);
    await writeFile(page.css.file, page.css.data);

    blockLineSuccess(`${page.name}`);
    blockLine(kleur.blue(`   ${page.link.replace("/index.html", "")}`));
  } catch (err) {
    throw Error(err);
  }
};
