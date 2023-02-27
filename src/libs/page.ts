const { writeFile } = require("fs").promises;

import { join } from "path";
import { blockLine, blockLineSuccess } from "cli-block";

import {
  Payload,
  File,
  Page,
  buildHtmlArgs,
  MenuItem,
  Project,
  Language,
} from "../types";
import { getLanguageMenu, getDefaultLanguage } from "../libs/language";
import { makePath, buildHtml, getParentFile } from "./files";

import { createDir } from "@sil/tools/dist/lib/system";
import { createCss } from "./buildStyle/style";
import kleur from "kleur";
import { getThumbnail } from "./media";
import { findWebComponents } from "./webcomponents";

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

const hasLanguages = (languages: Language[]) => !!(languages.length > 1);
const subtitle = (file: File, payload: Payload): string => {
  if (!file.home) {
    const parent = getParentFile(file, payload.files);
    return parent?.title || "";
  } else {
    return "";
  }
};

const getProjectByLanguage = (
  project: Project,
  language: Language
): Project => {
  const langProject = {};
  Object.entries(project).filter((value) => {
    if (value[0].includes(":")) {
      if (value[0].includes(`:${language}`)) {
        langProject[value[0].split(":")[0]] = value[1];
      }
    } else {
      langProject[value[0]] = value[1];
    }
  });

  return langProject;
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
  const project = getProjectByLanguage(payload.project, currentLanguage);
  const favicons = payload.favicons;
  const tags = payload.tags
    ? payload.tags.filter((tag) => tag.parent == file.parent)
    : [];

  const style = {
    ...payload.style,
    page: currentLink.replace(".html", ".css"),
  };

  const data: buildHtmlArgs = {
    menu,
    tags,
    thumbnail: getThumbnail(file),
    project,
    style,
    favicons,
    media: payload.media,
    logo: payload.logo,
    meta: file.meta,
    contentOnly: false,
    showContentImage: file.meta?.image && file.meta.type !== "photo",
    homeLink: file.language == getDefaultLanguage() ? "/" : `/${file.language}`,
    langMenu: getLanguageMenu(payload, file),
    language: currentLanguage,
    subtitle: subtitle(file, payload),
    components: [],
    has: {
      table: hasTable(file),
      header: hasHeader(menu),
      urlToken: hasUrlToken(file),
      colors: hasColors(file),
      languages: hasLanguages(payload.languages),
    },
  };
  // Prerender before actual render
  const prerender = await buildHtml(file, data);
  data.components = await findWebComponents(prerender)


  // Render final html
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

  // const customCss = await createCss(customHtml, payload.style.og);

  /*
   * Return the page
   */
  return {
    dir: join(
      payload.settings.output,
      currentLink.split("/").slice(0, -1).join("/")
    ),
    css: {
      data: '',
      file: customCssFilePath,
    },
    html: {
      data: html,
      file: join(payload.settings.output, currentLink),
    },
    name: file.name,
    link: currentLink,
    title: file.title,
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

    blockLineSuccess(`${page.title}`);
    blockLine(kleur.blue(`   ${page.link.replace("/index.html", "")}`));
    if (file.archives) {
      file.archives.forEach((f) => {
        blockLine(`   Archive`);
        f.children.forEach((c) => {
          blockLine(`   - ${c.title}`);
        });
      });
    }
  } catch (err) {
    throw Error(err);
  }
};
