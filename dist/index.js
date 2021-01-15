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
exports.media = exports.build = exports.menu = exports.styles = exports.settings = exports.files = void 0;
const markdown_1 = require("./libs/markdown");
const helpers_1 = require("./libs/helpers");
const files_1 = require("./libs/files");
const svg_1 = require("./libs/svg");
const { readFile, writeFile } = require("fs").promises;
const { existsSync } = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const log = __importStar(require("cli-block"));
/*

  Files

*/
exports.files = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let files = yield files_1.getFiles(process.cwd(), ".md");
    let project = {};
    yield helpers_1.asyncForEach(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        // Compile file to html
        const html = yield markdown_1.toHtml(file.data).then((r) => r);
        files[index] = Object.assign(Object.assign({}, file), { html: html });
        // Get Project Config
        project = files_1.getProjectConfig(html.meta);
    }));
    // Filter files
    if (project === null || project === void 0 ? void 0 : project.ignore) {
        files = files.filter((file) => !project.ignore.some((ignore) => file.path.includes(ignore)));
    }
    // console.log(project);
    if ((project === null || project === void 0 ? void 0 : project.logo) && (project === null || project === void 0 ? void 0 : project.logo.includes(".svg"))) {
        const logoData = yield files_1.getFileData({
            name: "",
            path: path_1.join(process.cwd(), project.logo),
            relativePath: project.logo,
        });
        try {
            const svgFile = svg_1.cleanupSvg(logoData);
            project.logoData = svgFile;
        }
        catch (err) {
            console.log(err);
        }
    }
    if (Object.keys(project).length) {
        log.BLOCK_MID("Project settings");
        log.BLOCK_SETTINGS(project, {}, { exclude: ["logoData"] });
    }
    return Object.assign(Object.assign({}, payload), { files: files, project });
});
/*

  Settings

*/
exports.settings = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = {
        output: path_1.join(process.cwd(), "public"),
    };
    return Object.assign(Object.assign({}, payload), { settings });
});
/*

  Styles

*/
exports.styles = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Download the style
    let style = {};
    yield files_1.download("https://stil.style/default.css", path_1.join(__dirname, "../dist/style.css"));
    const styleData = yield readFile(path_1.join(__dirname, "../dist/style.css")).then((res) => res.toString());
    if (payload.files.length > 1) {
        yield helpers_1.createDir(payload.settings.output);
        const filePath = path_1.join(payload.settings.output, "style.css");
        yield writeFile(filePath, styleData);
        style.path = "/style.css";
    }
    else {
        style.sheet = styleData;
    }
    if (payload.project.styleOverrule)
        style.path = payload.project.styleOverrule;
    if (payload.project.style)
        style.add = payload.project.style;
    return Object.assign(Object.assign({}, payload), { style });
});
exports.menu = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let menu = payload.files
        .map((file) => {
        var _a, _b;
        return ({
            name: ((_b = (_a = file.html) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.title) || file.name,
            path: files_1.makePath(file.path),
            active: !!!file.html.meta.hide,
        });
    })
        .filter((item) => item.active);
    log.BLOCK_MID("Navigation");
    let menuItems = {};
    if (menu.length > 1)
        menu.forEach((item) => {
            menuItems[item.name] = item.path;
        });
    if (menu.length < 2) {
        yield log.BLOCK_LINE("No menu");
        menu = [];
    }
    else
        yield log.BLOCK_SETTINGS(menuItems);
    return Object.assign(Object.assign({}, payload), { menu });
});
/*

  Build

*/
exports.build = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    log.BLOCK_MID("Pages");
    yield helpers_1.asyncForEach(payload.files, (file) => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            menu: payload.menu,
            style: payload.style,
            project: payload.project,
            media: payload.media,
        };
        console.log(data);
        const html = yield files_1.buildHtml(file, data);
        const fileName = files_1.makePath(file.path);
        yield helpers_1.createDir(path_1.join(payload.settings.output, fileName.split("/").slice(0, -1).join("")));
        try {
            yield writeFile(path_1.join(payload.settings.output, fileName), html);
            log.BLOCK_LINE_SUCCESS(`${file.name} created → ${fileName}`);
        }
        catch (err) {
            throw Error(err);
        }
    }));
    return Object.assign({}, payload);
});
exports.media = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let mediaFiles = [];
    yield helpers_1.asyncForEach(["assets", "media"], (folder) => __awaiter(void 0, void 0, void 0, function* () {
        const exists = yield existsSync(path_1.join(process.cwd(), folder));
        if (exists) {
            yield fs_extra_1.copy(path_1.join(process.cwd(), folder), path_1.join(payload.settings.output, folder))
                .then(() => __awaiter(void 0, void 0, void 0, function* () { return yield log.BLOCK_LINE_SUCCESS(`Copied ${folder} folder`); }))
                .catch((err) => console.error(err));
            mediaFiles = [
                ...(yield files_1.getFileTree(path_1.join(process.cwd(), folder), ".svg")),
            ];
        }
    }));
    return Object.assign(Object.assign({}, payload), { media: mediaFiles });
});
helpers_1.hello()
    .then(exports.settings)
    .then((s) => {
    log.BLOCK_START("Open Letter");
    return s;
})
    .then(exports.files)
    .then(exports.styles)
    .then(exports.media)
    .then(exports.menu)
    .then(exports.build)
    .then(() => {
    log.BLOCK_END();
});
//# sourceMappingURL=index.js.map