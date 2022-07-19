const { writeFile } = require("fs").promises;

import { join } from "path";
import { blockLine, blockLineSuccess } from "cli-block";

import { Payload, File, Page, buildHtmlArgs, MenuItem, Tag } from "../types";
import { getLanguageMenu, defaultLanguage } from "../libs/language";
import { getImagePath } from "./media";
import { makePath, buildHtml, getParentFile } from "./files";

import { createDir } from "@sil/tools/dist/lib/system";
import { createCss } from "./style";
import kleur from "kleur";
import { getThumbnail } from "./media";
import { MEDIA_SIZE_NAME } from "../const";

const simplifyUrl = (url: string): string => url.replace("/index.html", "");

const isActiveMenu = (link: string, current: string): boolean =>
  simplifyUrl(link) == simplifyUrl(current);

const isActiveMenuParent = (link: string, current: string): boolean =>
  simplifyUrl(current).includes(simplifyUrl(link)) &&
  simplifyUrl(current) !== "" &&
  simplifyUrl(link) !== "";

const hasTable = (file: File) => file.html && file.html.includes("<table>");

const hasUrlToken = (file: File) =>
  file.html && file.html.includes('<span class="token url">http');

const hasHeader = (menu: MenuItem[]) => menu.length > 0;

const hasColors = (file: File) =>
  file.html && !!file.html.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/i);

const subtitle = (file: File, payload: Payload): string => {
  if (!file.home) {
    const parent = getParentFile(file, payload.files);
    return parent?.title || "";
  } else {
    return "";
  }
};

const getTags = (payload: Payload, file: File): Tag[] =>
  file.parent?.id
    ? payload.tags.filter((tag) => tag.parent.id === file.parent.id)
    : [];

const homeLink = (file: File) =>
  file.language == defaultLanguage ? "/" : `/${file.language}`;

enum BackgroundLocation {
  BODY = "body",
  SECTION = "section",
}
const getBackground = (
  file: File,
  location: BackgroundLocation
): string | null => {
  // console.log(
  //   file.meta.bodyBackground,
  //   getImagePath(file.meta.bodyBackground, MEDIA_SIZE_NAME.LARGE)
  // );
  switch (location) {
    case BackgroundLocation.BODY:
      return file.meta.bodyBackground
        ? `background-image: url(${getImagePath(
            file.meta.bodyBackground,
            MEDIA_SIZE_NAME.LARGE
          )})`
        : null;
    case BackgroundLocation.SECTION:
      return file.meta.sectionBackground
        ? `background-image: url(${getImagePath(
            file.meta.sectionBackground,
            MEDIA_SIZE_NAME.LARGE
          )})`
        : null;
    default:
      return null;
  }
};

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

  const data: buildHtmlArgs = {
    menu,
    tags: getTags(payload, file),
    thumbnail: getThumbnail(file),
    style: { ...payload.style, page: currentLink.replace(".html", ".css") },
    project: payload.project,
    media: payload.media,
    logo: payload.logo,
    favicon: payload.favicon,
    meta: file.meta,
    contentOnly: false,
    showContentImage: file.meta?.image && file.meta.type !== "photo",
    homeLink: homeLink(file),
    langMenu: getLanguageMenu(payload, file),
    language: currentLanguage,
    subtitle: subtitle(file, payload),
    shop: payload.shop,
    has: {
      ...payload.has,
      archive: !!file.archive,
      menu: !!menu.length,
      table: hasTable(file),
      header: hasHeader(menu),
      urlToken: hasUrlToken(file),
      colors: hasColors(file),
    },
    background: {
      body: getBackground(file, BackgroundLocation.BODY),
      section: getBackground(file, BackgroundLocation.SECTION),
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
