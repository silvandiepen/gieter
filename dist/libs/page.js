"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.createPage = void 0;
const { writeFile } = require("fs").promises;
const path_1 = require("path");
const log = __importStar(require("cli-block"));
const files_1 = require("./files");
const helpers_1 = require("./helpers");
exports.createPage = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        menu: payload.menu,
        style: payload.style,
        project: payload.project,
        media: payload.media,
        tags: payload.tags,
    };
    const html = yield files_1.buildHtml(file, data);
    const fileName = files_1.makeLink(file.path);
    yield helpers_1.createDir(path_1.join(payload.settings.output, fileName.split("/").slice(0, -1).join("/")));
    try {
        yield writeFile(path_1.join(payload.settings.output, fileName), html);
        log.BLOCK_LINE_SUCCESS(`${file.name} created → ${fileName}`);
    }
    catch (err) {
        throw Error(err);
    }
});
//# sourceMappingURL=page.js.map