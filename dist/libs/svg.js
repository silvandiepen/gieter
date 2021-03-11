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
exports.getSVGLogo = exports.cleanupSvg = void 0;
const files_1 = require("./files");
const path_1 = require("path");
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
    return logoData_Converted;
};
exports.cleanupSvg = cleanupSvg;
const getSVGLogo = (project) => __awaiter(void 0, void 0, void 0, function* () {
    let logo = "";
    if ((project === null || project === void 0 ? void 0 : project.logo) && (project === null || project === void 0 ? void 0 : project.logo.includes(".svg"))) {
        const logoData = yield files_1.getFileData({
            name: "",
            fileName: "",
            created: null,
            path: path_1.join(process.cwd(), project.logo),
            relativePath: project.logo,
        });
        try {
            const svgFile = exports.cleanupSvg(logoData);
            logo = svgFile;
        }
        catch (err) {
            console.log(err);
        }
    }
    return logo;
});
exports.getSVGLogo = getSVGLogo;
//# sourceMappingURL=svg.js.map