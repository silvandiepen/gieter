import { extname, resolve, basename, join } from "path";
import fetch from "node-fetch";
import https from "https";
import { dirname } from "path";
import { createWriteStream, statSync } from "fs";
const { readdir, readFile, mkdir } = require("fs").promises;
import pug from "pug";
import { format } from "date-fns";

import { File, buildHtmlArgs, Project, Meta, FileType } from "../types";

import {
  defaultLanguage,
  fixLangInPath,
  getLangFromFilename,
  getLangFromPath,
} from "./language";
import { asyncForEach, removeTitle } from "./helpers";

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
    direntGroup.map(async (dirent: any) => {
      const result = resolve(dir, dirent.name);
      const extension = extname(result);
      const fileName = basename(result).replace(extension, "");
      const relativePath = result.replace(process.cwd(), "");

      const lang =
        fileName.indexOf(":") > 0 ? getLangFromFilename(fileName) : "en";

      let name = (fileName == "index"
        ? relativePath.split("/")[relativePath.split("/").length - 2]
        : fileName
      ).toLowerCase();

      if (dirent.isDirectory() && dirent.name.indexOf("_") !== 0) {
        return getFileTree(result, filter);
      } else if (extension == filter) {
        const { birthtime } = statSync(result);
        console.log(extension, filter);
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
    .filter((file) => (filter ? file.ext == filter : true));
};

export const getFileData = async (file: File): Promise<string> => {
  try {
    return await readFile(file.path).then((res) => res.toString());
  } catch (err) {
    throw Error(err);
  }
};

export const getFiles = async (dir: string, ext: string): Promise<File[]> => {
  const fileTree = await getFileTree(dir, ext);

  const files = [];

  await asyncForEach(fileTree, async (file: File) => {
    const data = await getFileData(file);
    if (file.fileName.indexOf("_") !== 0) {
      const parentPath = dirname(file.relativePath).replace(process.cwd(), "");
      const fileLanguage = getLangFromPath(file.relativePath);
      const fileLanguageExtension =
        fileLanguage == defaultLanguage ? "" : `:${fileLanguage}`;

      const parentFile1 = join(parentPath, `readme${fileLanguageExtension}.md`);
      const parentFile2 = join(parentPath, `readme${fileLanguageExtension}.md`);

      // console.log(parentPath, fileLanguage);
      // console.log(parentFile1, parentFile2);

      const parent = fileTree.find((f) => {
        return f.relativePath == parentFile1 || parentFile2;
      });

      console.log(parent);

      files.push({
        ...file,
        type: FileType.CONTENT,
        data,
        parent: file.relativePath.split("/")[
          file.relativePath.split("/").length - 2
        ],
      });
    }
  });

  return files;
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
    archives: file.archives || [],
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

const renamePath = (ogLink: string, rename: string) => {
  const pathGroup = ogLink.split("/");
  pathGroup[pathGroup.length - 2] = rename;
  return pathGroup.join("/").toLowerCase();
};

export const makePath = (file: File): string => {
  let link = makeLink(file.path);
  if (file.meta.name) link = renamePath(link, file.meta.name);

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

export const createFolder = async (folder: string): Promise<void> => {
  try {
    await mkdir(folder, { recursive: true }, () => {
      return;
    });
  } catch (err) {
    throw Error(err);
  }
};

export const download = async (
  url: string,
  destination: string
): Promise<void> => {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  //@ts-ignore
  const res: any = await fetch(url, { agent });
  await createFolder(dirname(destination));
  await new Promise((resolve, reject) => {
    const fileStream = createWriteStream(destination);
    res.body?.pipe(fileStream);
    res.body?.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", () => {
      //@ts-ignore
      resolve();
    });
  });
};

export const getProjectConfig = (meta: Meta) => {
  let project: Project = {};
  // Merge configs
  Object.keys(meta).forEach((item) => {
    if (item.includes("project")) {
      const key = item.toLowerCase().replace("project", "");
      if (key == "ignore") {
        project[key] = [];
        meta[item].split(",").forEach((value) => {
          project.ignore.push(value.trim());
        });
      } else project[key] = meta[item];
    }
  });
  return project;
};
