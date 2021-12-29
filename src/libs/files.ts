const { readdir, mkdir, access, R_OK, W_OK, F_OK } = require("fs").promises;
import pug from "pug";
import { extname, resolve, basename, join } from "path";
import { statSync } from "fs";
import { format } from "date-fns";
import { renamePath, getFileData, asyncForEach } from "@sil/tools";

import { File, buildHtmlArgs, FileType, Dirent, Archive } from "../types";
import { fixLangInPath, getLangFromFilename } from "./language";
import { removeTitle, asyncEvery, asyncSome } from "./helpers";

/*
	::getFileTree
	Get all files and folders from the input
*/
export const fileId = (path: string): string =>
  fixLangInPath(path, false).replace(/\//g, "-").substring(1).split(".")[0];

export const getFileTree = async (
  dir: string,
  filter = ""
): Promise<File[]> => {
  // Do not search the following folders;
  const excludes = ["node_modules", ".git"];
  if (excludes.some((sub) => dir.includes(sub))) return;

  const direntGroup = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    direntGroup.map(async (dirent: Dirent) => {
      const result = resolve(dir, dirent.name);
      const extension = extname(result);
      const fileName = basename(result).replace(extension, "");
      const relativePath = result.replace(process.cwd(), "");

      const lang =
        fileName.indexOf(":") > 0 ? getLangFromFilename(fileName) : "en";

      const name = (
        fileName == "index"
          ? relativePath.split("/")[relativePath.split("/").length - 2]
          : fileName
      ).toLowerCase();

      if (dirent.isDirectory() && dirent.name.indexOf("_") !== 0)
        return getFileTree(result);
      else {
        const { birthtime } = statSync(result);

        return {
          id: fileId(relativePath),
          fileName: fileName.split(":")[0],
          name: name.split(":")[0],
          relativePath,
          created: birthtime,
          path: result,
          ext: extension,
          language: lang,
        };
      }
    })
  );
  return Array.prototype
    .concat(...files)
    .filter((r) => r !== null)
    .filter((file) => file)
    .filter((file) => (filter ? file.ext == filter : true));
};

export const getFiles = async (dir: string, ext: string): Promise<File[]> => {
  const fileTree = await getFileTree(dir, ext);

  const files = [];

  await asyncForEach(fileTree, async (file: File) => {
    const data = await getFileData(file.path);
    if (file.fileName.indexOf("_") !== 0)
      files.push({
        ...file,
        type: FileType.CONTENT,
        data,
        parent:
          file.relativePath.split("/")[file.relativePath.split("/").length - 2],
      });
  });

  return files;
};

const filterBlog = (file: File): Archive[] => {
  if (file?.archives && file?.archives[0]?.children?.length) {
    if (!file.relativePath) {
      return file.archives;
    }
    const parentUrl = file.relativePath
      .split("/")
      .filter(Boolean)
      .slice(0, -1)
      .join("-");

    file.archives[0].children = file.archives[0].children.filter((child) => {
      const childUrl = child.link
        .split("/")
        .filter(Boolean)
        .slice(0, -2)
        .join("-");
      return childUrl == parentUrl;
    });

    return file.archives;
  } else {
    return [];
  }
};

export const buildHtml = async (
  file: File,
  args: buildHtmlArgs,
  template = ""
): Promise<string> => {
  const options = {
    ...args,
    name: file.name,
    title: file.title,
    content: file.html,
    meta: file.meta,
    pretty: true,
    archives: filterBlog(file),
    type: file.type,
    formatDate: format,
    removeTitle: removeTitle,
  };

  const templatePath = join(
    __dirname,
    `../../src/${template ? template : "template/page.pug"}`
  );

  const html = pug.renderFile(templatePath, options);

  return html;
};

export const makePath = (file: File): string => {
  let link = makeLink(file.path);
  if (file.meta.name) link = renamePath(link, file.meta.name.toString());

  return link;
};

export const makeLink = (path: string): string => {
  const uri = fixLangInPath(
    path
      .replace(process.cwd(), "")
      .toLowerCase()
      .replace("readme", "index")
      .replace(".md", ".html")
  );

  return uri.split("/")[uri.split("/").length - 1].replace(".html", "") !==
    "index"
    ? uri.replace(".html", "/index.html")
    : uri;
};

export const fileExists = async (path: string): Promise<boolean> => {
  try {
    await access(join(__dirname, path), R_OK | W_OK | F_OK);
    return true;
  } catch {
    return false;
  }
};

export const filesExist = async (
  paths: string[],
  some = false
): Promise<boolean> => {
  const action = some ? asyncSome : asyncEvery;
  try {
    await action(paths, async (file: string) => await fileExists(file));
    return true;
  } catch (err) {
    return false;
  }
};
