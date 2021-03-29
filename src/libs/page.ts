import { writeFile } from "fs/promises";
import { join } from "path";
import * as log from "cli-block";

import { Payload, File, Page } from "../types";
import { getLanguageMenu, defaultLanguage } from "../libs/language";
import { makePath, buildHtml } from "./files";
import { createDir } from "./helpers";
import { createCss } from "./style";
import kleur from 'kleur'


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
  const data = {
    menu: payload.menu
      ? payload.menu
          .map((item) => ({
            ...item,
            current: isActiveMenu(item.link, currentLink),
            isParent: isActiveMenuParent(item.link, currentLink),
          }))
          .filter((item) => item.language == currentLanguage)
      : [],
    style: { ...payload.style, page: currentLink.replace(".html", ".css") },
    project: payload.project,
    media: payload.media,
    tags: payload.tags
      ? payload.tags.filter((tag) => tag.parent == file.parent)
      : [],
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

    log.BLOCK_LINE_SUCCESS(
      `${page.name}`
    );
    log.BLOCK_LINE(
      kleur.blue(`   ${page.link.replace("/index.html", "")}`)
    )
  } catch (err) {
    throw Error(err);
  }
};
