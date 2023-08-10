// eslint-disable-next-line @typescript-eslint/no-var-requires
const { readdir } = require("fs").promises;

import pug from "pug";

import { extname, resolve, basename, join } from "path";
import { statSync } from "fs";
import { format } from "date-fns";

import { File, buildHtmlArgs, FileType, Dirent, Archive } from "@/types";
import { fixLangInPath, getLangFromFilename } from "@/libs/language";
import { asyncForEach, getFileData, renamePath } from "@/libs/tools";
import { removeTitle } from "@/libs/helpers";

/*
	::getFileTree
	Get all files and folders from the input
*/
export const fileId = (path: string): string =>
  fixLangInPath(path, false)
    .replace(/\//g, "-")
    .substring(1)
    .split(".")[0]
    .toLowerCase();

export const getFileTree = async (
  dir: string,
  filter: string[] = null
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
        fileName.toLowerCase() == "index" || fileName.toLowerCase() == "readme"
          ? relativePath.split("/")[relativePath.split("/").length - 2]
          : fileName
      ).toLowerCase();

      if (dirent.isDirectory() && dirent.name.indexOf("_") !== 0) {
        return getFileTree(result, filter);
      } else if (filter.includes(extension)) {
        const { birthtime } = statSync(result);

        return {
          id: fileId(relativePath),
          fileName: fileName.split(":")[0],
          name,
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
    .filter((file) =>
      filter ? (filter as string[]).includes(file.ext) : true
    );
};

export const getFiles = async (dir: string, ext: string): Promise<File[]> => {
  const fileTree = await getFileTree(dir, [ext]);

  const files = [];

  const getParentId = (file: File) => {
    const parentPath = file.relativePath
      .toLowerCase()
      .replace("/readme.md", "");
    const parentId = parentPath.split("/")[parentPath.split("/").length - 2];

    return parentId;
  };

  await asyncForEach(fileTree, async (file: File) => {
    const data = await getFileData(file.path);
    if (file.fileName.indexOf("_") !== 0)
      files.push({
        ...file,
        type: FileType.CONTENT,
        data,
        parent: getParentId(file),
      });
  });
  return files;
};

const filterArchive = (file: File): Archive[] => {
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

const replaceList = async (file: File) => {
  if (!file.meta.list) return file.html;

  if (file.meta.list) {
    try {
      const list = await getFileData(join(process.cwd(), file.meta.list));

      const startStr = `<!-- list -->`;
      const endStr = `<!-- /list -->`;

      const startIndex = file.data.indexOf(startStr) + startStr.length;
      const endIndex = file.data.indexOf(endStr);

      if (startIndex && endIndex) {
        const listTemplate = file.data.substring(startIndex, endIndex);
        console.log(listTemplate);

        const renderedList = pug.render(listTemplate, {
          list
        });
        
        const startIndexHtml = file.html.indexOf(startStr) + startStr.length;
        const endIndexHtml = file.html.indexOf(endStr);

        return file.html.substring(0,startIndexHtml) + renderedList + file.html.substring(endIndexHtml + endStr.length, file.html.length);
      }
      return file.html;
    } catch (err) {
      console.log(err);
    }
  }
};

export const buildHtml = async (
  file: File,
  args: buildHtmlArgs,
  template = ""
): Promise<string> => {
  const archives = filterArchive(file);

  archives.map((archive) => {
    if (archive.type === "blog") {
      archive.children;
      return {
        ...archive,
        children: archive.children.sort((a, b) =>
          b.created > a.created ? 1 : a.created > b.created ? -1 : 0
        ),
      };
    }
    return archive;
  });

  const content = await replaceList(file);

  const options = {
    ...args,
    name: file.name,
    title: file.title,
    content,
    meta: file.meta,
    pretty: true,
    archives: archives,
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

export const getParentFile = (child: File, files: File[]): File | undefined => {
  const file = files.find(
    (f) => f.parent == child.parent && f.home && f.id !== child.id
  );

  return file;
};
