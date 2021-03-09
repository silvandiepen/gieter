"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceImageSvg = exports.cleanupSvg = void 0;
const { readFile } = require("fs").promises;
const blankLines = new RegExp(/(^[ \t]*\n)/, "gm");
const attrRegex = (attr) => new RegExp(` ${attr}="[^"]*"`, "gi");
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
String.prototype.removeAttributes = function (attributes) {
    let str = String(this);
    (typeof attributes == "string"
        ? [attributes]
        : attributes).forEach((attr) => {
        str = str.replace(attrRegex(attr), "");
    });
    return str.toString();
};
const cleanupSvg = (file) => {
    let logoData = file;
    let logoData_Converted = logoData
        .removeHtmlComments()
        .removeXmlDoctype()
        .removeBlankLines()
        .removeAttributes(["version", "id"]);
    return logoData;
};
exports.cleanupSvg = cleanupSvg;
function findMatches(regex, str, matches = []) {
    const res = regex.exec(str);
    res && matches.push(res) && findMatches(regex, str, matches);
    return matches;
}
String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};
const replaceImageSvg = (file) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.replaceImageSvg = replaceImageSvg;
//# sourceMappingURL=svg.js.map