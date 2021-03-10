const { writeFile } = require("fs").promises;
import { join } from "path";
import * as log from "cli-block";

import { Payload, File } from "../types";
import { makeLink, buildHtml } from "./files";
import { createDir } from "./helpers";
import { createCss } from "./style";

const simplifyUrl = (url: string): string => url.replace("/index.html", "");

const isActiveMenu = (link: string, current: string): boolean => {
  if (simplifyUrl(link) == simplifyUrl(current)) return true;
  return false;
};

const isActiveMenuParent = (link: string, current: string): boolean => {
  if (
    simplifyUrl(current).includes(simplifyUrl(link)) &&
    simplifyUrl(current) !== "" &&
    simplifyUrl(link) !== ""
  )
    return true;
  return false;
};

interface PageCss {
  data: string;
  file: string;
}
interface PageHtml {
  data: string;
  file: string;
}

interface Page {
  dir: string;
  css: PageCss;
  html: PageHtml;
  link: string;
  name: string;
}
export const buildPage = async (
  payload: Payload,
  file: File
): Promise<Page> => {
  const currentLink = makeLink(file.path);

  const data = {
    menu: payload.menu
      ? payload.menu.map((item) => ({
          ...item,
          current: isActiveMenu(item.link, currentLink),
          isParent: isActiveMenuParent(item.link, currentLink),
        }))
      : [],
    style: { ...payload.style, page: currentLink.replace(".html", ".css") },
    project: payload.project,
    media: payload.media,
    tags: payload.tags
      ? payload.tags.filter((tag) => tag.parent == file.parent)
      : [],
    meta: file.meta,
    contentOnly: false,
  };

  const html = await buildHtml(file, data);

  // Custom Css
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

  // console.log(customHtml);
  const customCss = await createCss(customHtml, payload.style.og);

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

    log.BLOCK_LINE_SUCCESS(`${page.name} created → ${page.link}`);
  } catch (err) {
    throw Error(err);
  }
};

export const createApiPage = async (
  payload: Payload,
  file: File
): Promise<void> => {
  // const page = await buildPage(payload, file);
  // console.log(file);
  // await createDir(page.dir);
  // try {
  //   await writeFile(page.html.file, page.html.data);
  //   await writeFile(page.css.file, page.css.data);
  //   log.BLOCK_LINE_SUCCESS(`${page.name} created → ${page.link}`);
  // } catch (err) {
  //   throw Error(err);
  // }
};
