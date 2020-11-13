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
const files_1 = require("./libs/files");
const helpers_1 = require("./libs/helpers");
const fs_1 = require("fs");
const path_1 = require("path");
const log = __importStar(require("cli-block"));
const files = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield files_1.getFiles(process.cwd());
    yield helpers_1.asyncForEach(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        const html = yield markdown_1.toHtml(file.data).then((r) => r);
        files[index] = Object.assign(Object.assign({}, file), { html: html });
    }));
    return Object.assign(Object.assign({}, payload), { files: files });
});
const build = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Create an output folder
    const menu = payload.files.map((file) => {
        return {
            name: file.name,
            path: files_1.makePath(file.path),
        };
    });
    const outputFolder = path_1.join(process.cwd(), "public");
    yield helpers_1.asyncForEach(payload.files, (file) => __awaiter(void 0, void 0, void 0, function* () {
        const html = yield files_1.buildHtml(file, menu);
        const fileName = files_1.makePath(file.path);
        const fileDir = path_1.join(outputFolder, fileName.split("/").slice(0, -1).join(""));
        try {
            !fs_1.existsSync(fileDir) && fs_1.mkdirSync(fileDir, { recursive: true });
        }
        catch (error) {
            console.log(error);
        }
        yield fs_1.writeFile(path_1.join(outputFolder, fileName), html, () => __awaiter(void 0, void 0, void 0, function* () {
            yield log.BLOCK_LINE_SUCCESS(`${file.name} created → ${fileName}`);
        }));
    }));
    return Object.assign({}, payload);
});
const hello = () => __awaiter(void 0, void 0, void 0, function* () {
    log.BLOCK_START("Building your vue");
    return {};
});
const stop = () => __awaiter(void 0, void 0, void 0, function* () {
    log.BLOCK_END();
});
hello()
    .then(files)
    .then((s) => __awaiter(void 0, void 0, void 0, function* () { return yield build(s); }))
    .then(stop);
//# sourceMappingURL=index.js.map