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
exports.getSVGLogo = void 0;
const types_1 = require("../types");
const files_1 = require("./files");
const path_1 = require("path");
const getSVGLogo = (project) => __awaiter(void 0, void 0, void 0, function* () {
    let logo = "";
    if ((project === null || project === void 0 ? void 0 : project.logo) && (project === null || project === void 0 ? void 0 : project.logo.includes(".svg"))) {
        const logoData = yield files_1.getFileData({
            id: "",
            name: "",
            fileName: "",
            created: null,
            path: path_1.join(process.cwd(), project.logo),
            relativePath: project.logo,
            language: types_1.Language.EN,
        });
        logo = logoData;
    }
    return logo;
});
exports.getSVGLogo = getSVGLogo;
//# sourceMappingURL=svg.js.map