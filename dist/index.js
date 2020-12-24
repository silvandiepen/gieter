#!/usr/bin/env node
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
const markdown_1 = require("./libs/markdown");
const helpers_1 = require("./libs/helpers");
const files_1 = require("./libs/files");
const { readFile, writeFile } = require("fs").promises;
const path_1 = require("path");
const log = __importStar(require("cli-block"));
/*

  Files

*/
const files = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield files_1.getFiles(process.cwd());
    yield helpers_1.asyncForEach(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        const html = yield markdown_1.toHtml(file.data).then((r) => r);
        files[index] = Object.assign(Object.assign({}, file), { html: html });
    }));
    return Object.assign(Object.assign({}, payload), { files: files });
});
/*

  Settings

*/
const settings = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = {
        output: path_1.join(process.cwd(), "public"),
    };
    return Object.assign(Object.assign({}, payload), { settings });
});
/*

  Styles

*/
const styles = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Download the style
    yield files_1.download("https://stil.style/default.css", path_1.join(__dirname, "../dist/style.css"));
    const styleData = yield readFile(path_1.join(__dirname, "../dist/style.css")).then((res) => res.toString());
    if (payload.files.length > 1) {
        yield helpers_1.createDir(payload.settings.output);
        const filePath = path_1.join(payload.settings.output, "style.css");
        yield writeFile(filePath, styleData);
        return Object.assign(Object.assign({}, payload), { style: null });
    }
    else {
        return Object.assign(Object.assign({}, payload), { style: styleData });
    }
});
/*

  Build

*/
const build = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const menu = payload.files.map((file) => {
        return {
            name: file.name,
            path: files_1.makePath(file.path),
        };
    });
    yield helpers_1.asyncForEach(payload.files, (file) => __awaiter(void 0, void 0, void 0, function* () {
        const html = yield files_1.buildHtml(file, menu, payload.style);
        const fileName = files_1.makePath(file.path);
        yield helpers_1.createDir(path_1.join(payload.settings.output, fileName.split("/").slice(0, -1).join("")));
        yield writeFile(path_1.join(payload.settings.output, fileName), html, () => __awaiter(void 0, void 0, void 0, function* () {
            yield log.BLOCK_LINE_SUCCESS(`${file.name} created → ${fileName}`);
        }));
    }));
    return Object.assign({}, payload);
});
helpers_1.hello()
    .then(settings)
    .then(files)
    .then(styles)
    .then(build)
    .then(() => {
    log.BLOCK_END();
});
//# sourceMappingURL=index.js.map