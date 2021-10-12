#!/usr/bin/env node
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
exports.media = exports.contentPages = exports.settings = exports.files = void 0;
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const cli_block_1 = require("cli-block");
const markdown_1 = require("./libs/markdown");
const helpers_1 = require("./libs/helpers");
const files_1 = require("./libs/files");
const project_1 = require("./libs/project");
const svg_1 = require("./libs/svg");
const page_1 = require("./libs/page");
const tags_1 = require("./libs/tags");
const style_1 = require("./libs/style");
const menu_1 = require("./libs/menu");
const archives_1 = require("./libs/archives");
const favicon_1 = require("./libs/favicon");
// eslint-disable-next-line
const PackageJson = require("../package.json");
/*
 * Files
 */
const files = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let files = yield files_1.getFiles(process.cwd(), ".md");
    // const project: Project = {};
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
    }));
    const project = yield project_1.getProjectData(files);
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
        // const parentName =
        //   file.parent && file.name !== file.parent ? file.parent : "";
        // const parent = files.find((file) => file.name === parentName);
        const title = ((_a = file.meta) === null || _a === void 0 ? void 0 : _a.title) ? file.meta.title : helpers_1.fileTitle(file);
        files[index].title = title.toString();
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
        cli_block_1.blockMid("Project settings");
        cli_block_1.blockSettings(project, {}, { exclude: ["logoData"] });
    }
    return Object.assign(Object.assign({}, payload), { files: files, project,
        languages });
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
    if (payload.languages.length > 1) {
        // Create Content pages
        yield helpers_1.asyncForEach(payload.languages, (language) => __awaiter(void 0, void 0, void 0, function* () {
            cli_block_1.blockMid(`Pages ${language}`);
            yield helpers_1.asyncForEach(payload.files.filter((file) => file.language == language), (file) => __awaiter(void 0, void 0, void 0, function* () { return yield page_1.createPage(payload, file); }));
        }));
    }
    else {
        cli_block_1.blockMid("Pages");
        yield helpers_1.asyncForEach(payload.files, (file) => __awaiter(void 0, void 0, void 0, function* () { return yield page_1.createPage(payload, file); }));
    }
    return Object.assign({}, payload);
});
exports.contentPages = contentPages;
const media = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let mediaFiles = [];
    yield helpers_1.asyncForEach(["assets", "media"], (folder) => __awaiter(void 0, void 0, void 0, function* () {
        const exists = yield fs_1.existsSync(path_1.join(process.cwd(), folder));
        if (exists) {
            yield fs_extra_1.copy(path_1.join(process.cwd(), folder), path_1.join(payload.settings.output, folder))
                .then(() => cli_block_1.blockLineSuccess(`Copied ${folder} folder`))
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
    cli_block_1.blockHeader(`Open Letter ${PackageJson.version}`);
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
    cli_block_1.blockFooter();
});
//# sourceMappingURL=index.js.map