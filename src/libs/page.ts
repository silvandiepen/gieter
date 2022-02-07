const { writeFile } = require("fs").promises;

import { join } from "path";
import { blockLine, blockLineSuccess } from "cli-block";

import { Payload, File, Page, buildHtmlArgs } from "../types";
import { getLanguageMenu, defaultLanguage } from "../libs/language";
import { makePath, buildHtml } from "./files";

import { createDir } from "./tools";
import { createCss } from "./style";
import kleur from "kleur";

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

  const menu = payload.menu
    ? payload.menu
        .map((item) => ({
          ...item,
          current: isActiveMenu(item.link, currentLink),
          isParent: isActiveMenuParent(item.link, currentLink),
        }))
        .filter((item) => item.language == currentLanguage)
    : [];

  const tags = payload.tags
    ? payload.tags.filter((tag) => tag.parent == file.parent)
    : [];

  const thumbnail = file.meta?.thumbnail
    ? file.meta.thumbnail
    : file.meta?.image
    ? file.meta.image
    : null;

  const data: buildHtmlArgs = {
    menu,
    tags,
    thumbnail,
    style: { ...payload.style, page: currentLink.replace(".html", ".css") },
    project: payload.project,
    media: payload.media,
    meta: file.meta,
    contentOnly: false,
    showContentImage: file.meta?.image && file.meta.type !== "photo",
    favicon: payload.favicon,
    homeLink: file.language == defaultLanguage ? "/" : `/${file.language}`,
    langMenu: getLanguageMenu(payload, file),
    language: currentLanguage,
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
