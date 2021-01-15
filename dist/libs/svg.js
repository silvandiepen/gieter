"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupSvg = void 0;
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
exports.cleanupSvg = (file) => {
    let logoData = file;
    let logoData_Converted = logoData
        .removeHtmlComments()
        .removeXmlDoctype()
        .removeBlankLines()
        .removeAttributes(["version", "id"]);
    return logoData;
};
//# sourceMappingURL=svg.js.map