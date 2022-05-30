const { readdir } = require("fs").promises;
const fs = require("fs");
import pug from "pug";
import { extname, resolve, basename, join } from "path";
import { statSync } from "fs";
import { format } from "date-fns";
import { asyncForEach } from "@sil/tools";
import { getFileData, renamePath } from "@sil/tools/dist/lib/system";

import { File, buildHtmlArgs, FileType, Dirent } from "../types";
import { fixLangInPath, getLangFromPath } from "./language";
import { removeTitle } from "./helpers";

/*
	::getFileTree
	Get all files and folders from the input
*/
export const fileId = (path: string): string => {
  const language = getLangFromPath(path);
  const converted = path
    .replace(process.cwd(), "")
    .replace(/\//g, "-")
    .replace(".md", "")
    .substring(1)
    .toLowerCase();

  return language + "-" + converted;
};

const cleanupRelativePath = (p): string => {
  p = p.toLowerCase().replace("readme.md", "").replace("index.md","");
  if (p.length > 1 && p.charAt(p.length - 1) === "/") p = p.slice(0, -1);
  return p;
};

export const getFileTree = async (
  dir: string,
  filter: string[] = null
): Promise<File[]> => {
  // Do not search the following folders;
  const excludes = ["node_modules", ".git"];
  if (excludes.some((sub) => dir.includes(sub))) return;

  const direntGroup = await readdir(dir, { withFileTypes: true });

  // const direntGroup2 = fs.readdir(dir, { withFileTypes: true }, (_, files) => {
  //   return files;
  // });
  // console.log(direntGroup2);

  const files = await Promise.all(
    direntGroup.map(async (dirent: Dirent) => {
      const result = resolve(dir, dirent.name);
      const extension = extname(result);
      const fileName = basename(result).replace(extension, "");
      const relativePath = cleanupRelativePath(
        result.replace(process.cwd(), "")
      );

      const lang = getLangFromPath(result);

      // const lang =
      //   fileName.indexOf(":") > 0 ? getLangFromFilename(fileName) : "en";

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
          id: fileId(result),
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
    .filter((file) =>
      filter ? (filter as string[]).includes(file.ext) : true
    );
};

export const getFiles = async (dir: string, ext: string): Promise<File[]> => {
  const fileTree = await getFileTree(dir, [ext]);

  const files = [];

  await asyncForEach(
    fileTree.filter((f) => f.fileName.indexOf("_") !== 0),
    async (file: File) => {
      const data = await getFileData(file.path);
      files.push({
        ...file,
        type: FileType.CONTENT,
        data,
      });
    }
  );

  files.forEach((f, index) => {
    const p = f.relativePath;

    const parentPath = `/${p
      .split("/")
      .splice(1, p.split("/").length - 2)
      .join("/")}`;

    const parentFile = files.find(
      (parentFile) => parentFile.relativePath == parentPath
    );

    files[index].parent = {
      id: parentFile?.id,
      name: parentFile?.name,
    };
  });

  return files;
};

// const filterArchive = (file: File): Archive[] => {
//   // console.log(file.archives);

//   return file.archives || [];

//   // if (file?.archives && file?.archives[0]?.children?.length) {
//   //   if (!file.relativePath) {
//   //     return file.archives;
//   //   }
//   //   const parentUrl = file.relativePath
//   //     .split("/")
//   //     .filter(Boolean)
//   //     .slice(0, -1)
//   //     .join("-");

//   //   file.archives[0].children = file.archives[0].children.filter((child) => {
//   //     const childUrl = child.link
//   //       .split("/")
//   //       .filter(Boolean)
//   //       .slice(0, -2)
//   //       .join("-");
//   //     console.log(childUrl, parentUrl);
//   //     return childUrl == parentUrl;
//   //   });

//   //   return file.archives;
//   // } else {
//   //   return [];
//   // }
// };

export const buildHtml = async (
  file: File,
  args: buildHtmlArgs,
  template = ""
): Promise<string> => {
  // const archives = filterArchive(file);

  // console.log(file.archives);

  // archives.map((archive) => {
  //   if (archive.type === "blog") {
  //     return {
  //       ...archive,
  //       children: archive.children.sort((a, b) =>
  //         b.created > a.created ? 1 : a.created > b.created ? -1 : 0
  //       ),
  //     };
  //   } else {
  //     return {
  //       ...archive,
  //       children: archive.children.sort((a, b) =>
  //         b.fileName < a.fileName ? 1 : a.fileName < b.fileName ? -1 : 0
  //       ),
  //     };
  //   }
  // });

  const options = {
    ...args,
    name: file.name,
    title: file.title,
    content: file.html,
    meta: file.meta,
    pretty: true,
    archive: file.archive,
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
