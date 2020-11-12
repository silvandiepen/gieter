import { extname, resolve, basename, join } from "path";
import { MarkdownFile } from "../types";
import { asyncForEach } from "./helpers";
import pug from "pug";

const { readdir, readFile } = require("fs").promises;
/*
	::getFileTree
	Get all files and folders from the input
*/

export const getFileTree = async (
  dir: string,
  filter = ""
): Promise<MarkdownFile[]> => {
  // Do not search the following folders;
  const excludes = ["node_modules", ".git"];
  if (excludes.some((sub) => dir.includes(sub))) return;

  const direntGroup = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    direntGroup.map(async (dirent: any) => {
      const res = resolve(dir, dirent.name);
      const ext = extname(res);

      return dirent.isDirectory()
        ? getFileTree(res)
        : {
            name: basename(res).replace(ext, ""),
            path: res,
            ext: ext,
          };
    })
  );
  return Array.prototype
    .concat(...files)
    .filter((r) => r !== null)
    .filter((file) => file)
    .filter((file) => (filter ? file.ext == filter : true));
};

export const getFileData = async (
  file: MarkdownFile
): Promise<MarkdownFile> => {
  try {
    return await readFile(file.path).then((res) => res.toString());
  } catch (err) {
    throw Error(err);
  }
};

export const getFiles = async (dir: string): Promise<MarkdownFile[]> => {
  const fileTree = await getFileTree(dir, ".md");

  const files = [];

  await asyncForEach(fileTree, async (file: MarkdownFile) => {
    const data = await getFileData(file);
    files.push({
      ...file,
      data,
    });
  });
  return files;
};

export const buildHtml = async (file: MarkdownFile): Promise<string> => {
  const style = await readFile(
    join(process.cwd(), "dist/style.css")
  ).then((res) => res.toString());

  const options = {
    title: "Testje",
    content: file.html,
    style,
    pretty: true,
  };

  const html = pug.renderFile(
    join(__dirname, "../../src/template.pug"),
    options
  );

  return html;
};
