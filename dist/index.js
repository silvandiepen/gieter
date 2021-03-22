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
exports.media = exports.contentPages = exports.settings = exports.files = void 0;
const { existsSync } = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const log = __importStar(require("cli-block"));
const markdown_1 = require("./libs/markdown");
const helpers_1 = require("./libs/helpers");
const files_1 = require("./libs/files");
const svg_1 = require("./libs/svg");
const page_1 = require("./libs/page");
const tags_1 = require("./libs/tags");
const style_1 = require("./libs/style");
const menu_1 = require("./libs/menu");
const archives_1 = require("./libs/archives");
const favicon_1 = require("./libs/favicon");
const PackageJson = require("../package.json");
/*
 * Files
 */
const files = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let files = yield files_1.getFiles(process.cwd(), ".md");
    let project = {};
    /*
     * Languages
     */
    const languages = [];
    for (let i = 0; i < files.length; i++) {
        if (!languages.includes(files[i].language))
            languages.push(files[i].language);
    }
    /*
     * Generate all files into html and extract metadata
     */
    yield helpers_1.asyncForEach(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        const rendered = yield markdown_1.toHtml(file.data).then((r) => r);
        files[index] = Object.assign(Object.assign({}, file), { html: rendered.document, meta: rendered.meta });
        const projectMeta = files_1.getProjectConfig(rendered.meta);
        Object.keys(projectMeta).forEach((key) => {
            if (!project[key])
                project[key] = projectMeta[key];
        });
    }));
    /*
     * When the file is a "home" file, it gets certain privileges
     */
    yield helpers_1.asyncForEach(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        const relativePath = file.path.replace(process.cwd(), "");
        const pathGroup = relativePath.split("/");
        const isHome = pathGroup[pathGroup.length - 1].toLowerCase().includes("readme") ||
            pathGroup[pathGroup.length - 1].toLowerCase().includes("index");
        files[index].home = isHome;
    }));
    /*
     * Inherit Parent Metadata
     */
    yield helpers_1.asyncForEach(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const parentName = file.parent && file.name !== file.parent ? file.parent : "";
        const parent = files.find((file) => file.name === parentName);
        files[index].title = ((_a = file.meta) === null || _a === void 0 ? void 0 : _a.title) ? file.meta.title : helpers_1.fileTitle(file);
    }));
    /*
     * Filter ignored files
    
     * Can't be done directly, due to that project Settings can be given on any file. So all files need to be indexed before
     * filtering can happen.
     */
    if (project === null || project === void 0 ? void 0 : project.ignore)
        files = files.filter((file) => !project.ignore.some((ignore) => file.path.includes(ignore)));
    /*
     * If the logo is set in project settings, the logo will be downloaded and injected.
     */
    project.logoData = yield svg_1.getSVGLogo(project);
    /*
     * Logging
     */
    if (Object.keys(project).length) {
        log.BLOCK_MID("Project settings");
        log.BLOCK_SETTINGS(project, {}, { exclude: ["logoData"] });
    }
    return Object.assign(Object.assign({}, payload), { files: files, project, languages });
});
exports.files = files;
/*
 *  Settings
 */
const settings = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = {
        output: path_1.join(process.cwd(), "public"),
        languages: [],
    };
    return Object.assign(Object.assign({}, payload), { settings });
});
exports.settings = settings;
/*
 *  Build
 */
const contentPages = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    log.BLOCK_MID("Pages");
    // Get Siblings
    yield helpers_1.asyncForEach(payload.files, (file) => __awaiter(void 0, void 0, void 0, function* () { }));
    // Create Content pages
    yield helpers_1.asyncForEach(payload.files, (file) => __awaiter(void 0, void 0, void 0, function* () { return yield page_1.createPage(payload, file); }));
    // Create API
    yield helpers_1.asyncForEach(payload.files, (file) => __awaiter(void 0, void 0, void 0, function* () { return yield page_1.createApiPage(payload, file); }));
    return Object.assign({}, payload);
});
exports.contentPages = contentPages;
const media = (payload) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.media = media;
helpers_1.hello()
    .then(exports.settings)
    .then((s) => {
    log.BLOCK_START(`Open Letter ${PackageJson.version}`);
    return s;
})
    .then(exports.files)
    .then(exports.media)
    .then(tags_1.generateTags)
    .then(archives_1.generateArchives)
    .then(menu_1.generateMenu)
    .then(style_1.generateStyles)
    .then(favicon_1.generateFavicon)
    .then(exports.contentPages)
    .then(tags_1.createTagPages)
    .then(() => {
    log.BLOCK_END();
});
//# sourceMappingURL=index.js.map