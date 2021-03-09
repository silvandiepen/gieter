import { download } from "./files";
import { asyncForEach } from "./helpers";
import { join } from "path";
const { readFile } = require("fs").promises;
declare global {
  interface String {
    removeBlankLines(): string;
    removeHtmlComments(): string;
    removeXmlDoctype(): string;
    removeAttributes(attributes: string | string[]): string;
  }
}
const blankLines = new RegExp(/(^[ \t]*\n)/, "gm");
const attrRegex = (attr: string): any => new RegExp(` ${attr}="[^"]*"`, "gi");
const htmlCommentRegex = new RegExp("<!--(.*?)-->", "g");
const xmlDoctypeRegex = new RegExp("<?xml(.*?)?>", "g");

String.prototype.removeBlankLines = function () {
  return String(this).replace(blankLines, "").toString();
};
String.prototype.removeHtmlComments = function () {
  return String(this).replace(htmlCommentRegex, "").toString();
};
String.prototype.removeXmlDoctype = function () {
  return String(this).replace(xmlDoctypeRegex, "").toString();
};
String.prototype.removeAttributes = function (attributes: string | string[]) {
  let str = String(this);
  ((typeof attributes == "string"
    ? [attributes]
    : attributes) as string[]).forEach((attr) => {
    str = str.replace(attrRegex(attr), "");
  });
  return str.toString();
};

export const cleanupSvg = (file: string): string => {
  let logoData: string = file;

  let logoData_Converted = logoData
    .removeHtmlComments()
    .removeXmlDoctype()
    .removeBlankLines()
    .removeAttributes(["version", "id"]);

  return logoData;
};

function findMatches(regex, str, matches = []) {
  const res = regex.exec(str);
  res && matches.push(res) && findMatches(regex, str, matches);
  return matches;
}
(String.prototype as any).splice = function (idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

export const replaceImageSvg = async (file: string): Promise<string> => {
  // var regex = /<img.*?src=['"](.*?)['"].*?>/g;
  // var images = findMatches(regex, file);

  // if (images && images.length > 0) {
  //   await asyncForEach(images, async (img: unknown) => {
  //     if (img) {
  //       if (img[1].includes(".svg")) {
  //         const filename = img[1].split("/")[img[1].split("/").length - 1];
  //         const tempFile = `../../temp/${filename}`;

  //         await download(img[1], join(__dirname, tempFile));

  //         const svgFile = await readFile(
  //           join(__dirname, tempFile)
  //         ).then((res: any) => res.toString());

  //         const index = file.indexOf(img[0]);

  //         file =
  //           file.slice(0, index) + svgFile + file.slice(index + img[0].length);
  //       }
  //     }
  //   });
  // }

  return file;
};
