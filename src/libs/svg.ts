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

export {};
