const { writeFile } = require("fs").promises;
import { join } from "path";
import * as log from "cli-block";

import { Payload, File } from "../types";
import { makeLink, buildHtml } from "./files";
import { createDir } from "./helpers";

const simplifyUrl = (url: string): string => url.replace("/index.html", "");
const isActiveMenu = (link: string, current: string): boolean => {
  if (simplifyUrl(link) == simplifyUrl(current)) return true;
  return false;
};
const isActiveMenuParent = (link: string, current: string): boolean => {
  if (simplifyUrl(current).includes(simplifyUrl(link))) return true;
  return false;
};

export const createPage = async (
  payload: Payload,
  file: File
): Promise<void> => {
  const currentLink = makeLink(file.path);
  const data = {
    menu: payload.menu.map((item) => ({
      ...item,
      current: isActiveMenu(item.link, currentLink),
      isParent: isActiveMenuParent(item.link, currentLink),
    })),
    style: payload.style,
    project: payload.project,
    media: payload.media,
    tags: payload.tags.filter((tag) => tag.parent == file.parent),
  };
  const html = await buildHtml(file, data);

  await createDir(
    join(payload.settings.output, currentLink.split("/").slice(0, -1).join("/"))
  );
  try {
    await writeFile(join(payload.settings.output, currentLink), html);
    log.BLOCK_LINE_SUCCESS(`${file.name} created → ${currentLink}`);
  } catch (err) {
    throw Error(err);
  }
};
