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
const path_1 = require("path");
const cli_block_1 = require("cli-block");
const tools_1 = require("@sil/tools");
const markdown_1 = require("./libs/markdown");
const helpers_1 = require("./libs/helpers");
const media_1 = require("./libs/media");
const files_1 = require("./libs/files");
const project_1 = require("./libs/project");
const page_1 = require("./libs/page");
const tags_1 = require("./libs/tags");
const style_1 = require("./libs/style");
const menu_1 = require("./libs/menu");
const archives_1 = require("./libs/archives");
const favicon_1 = require("./libs/favicon");
const media_2 = require("./libs/media");
const shop_1 = require("./libs/shop");
const parent_1 = require("./libs/parent");
const sitemap_1 = require("./libs/sitemap");
// eslint-disable-next-line
const PackageJson = require("../package.json");
/*
 * Files
 */
const files = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let files = yield (0, files_1.getFiles)(process.cwd(), ".md");
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
    yield (0, tools_1.asyncForEach)(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        const rendered = yield (0, markdown_1.toHtml)(file.data).then((r) => r);
        files[index] = Object.assign(Object.assign({}, file), { html: rendered.document, meta: rendered.meta });
    }));
    const project = yield (0, project_1.getProjectData)(files);
    /*
     * When the file is a "home" file, it gets certain privileges
     */
    yield (0, tools_1.asyncForEach)(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        const relativePath = file.path.replace(process.cwd(), "");
        const pathGroup = relativePath.split("/");
        const thePath = pathGroup[pathGroup.length - 1].toLowerCase();
        const isHome = !thePath.includes(".md");
        files[index].home = isHome;
    }));
    /*
     * Inherit Parent Metadata
     */
    yield (0, tools_1.asyncForEach)(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        // const parentName =
        //   file.parent && file.name !== file.parent ? file.parent : "";
        // const parent = files.find((file) => file.name === parentName);
        var _a;
        const title = ((_a = file.meta) === null || _a === void 0 ? void 0 : _a.title) ? file.meta.title : (0, helpers_1.fileTitle)(file);
        files[index].title = title.toString();
    }));
    /*
     * Set the thumbnail for each file
     */
    yield (0, tools_1.asyncForEach)(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        const thumbnail = (0, media_2.getThumbnail)(file);
        const thumbnailSvg = yield (0, media_1.getSvgThumbnail)(thumbnail);
        files[index].thumbnail = thumbnail;
        files[index].thumbnailSvg = thumbnailSvg;
    }));
    /*
     * Filter ignored files
    
     * Can't be done directly, due to that project Settings can be given on any file. So all files need to be indexed before
     * filtering can happen.
     */
    if (project === null || project === void 0 ? void 0 : project.ignore)
        files = files.filter((file) => !project.ignore.some((ignore) => file.path.includes(ignore)));
    /*
     * Logging
     */
    if (Object.keys(project).length) {
        yield (0, cli_block_1.blockMid)("Project settings");
        yield (0, cli_block_1.blockSettings)(project, {}, { exclude: ["logoData"] });
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
        output: (0, path_1.join)(process.cwd(), "public"),
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
        yield (0, tools_1.asyncForEach)(payload.languages, (language) => __awaiter(void 0, void 0, void 0, function* () {
            (0, cli_block_1.blockMid)(`Pages ${language}`);
            yield (0, tools_1.asyncForEach)(payload.files
                .filter((file) => file.language == language)
                .filter((file) => !file.name.startsWith("-")), // Don't pages that start with a -
            (file) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, page_1.createPage)(payload, file); }));
        }));
    }
    else {
        (0, cli_block_1.blockMid)("Pages");
        yield (0, tools_1.asyncForEach)(payload.files
            .filter((file) => !file.name.startsWith("-")) // Don't pages that start with a -
            .map((file) => (Object.assign(Object.assign({}, file), { id: file.id.replace(`${payload.languages[0]}-`, "") }))), // remove language from file id
        (file) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, page_1.createPage)(payload, file); }));
    }
    return Object.assign({}, payload);
});
exports.contentPages = contentPages;
const media = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const media = yield (0, media_1.getMedia)(payload);
    const logo = yield (0, media_1.getLogo)(payload, media);
    return Object.assign(Object.assign({}, payload), { media, logo });
});
exports.media = media;
(0, tools_1.hello)()
    .then(exports.settings)
    .then((s) => {
    (0, cli_block_1.blockHeader)(`Gieter ${PackageJson.version}`);
    return s;
})
    .then(exports.files)
    .then(parent_1.parent)
    .then(exports.media)
    .then(tags_1.generateTags)
    .then(archives_1.generateArchives)
    .then(shop_1.generateShop)
    .then(menu_1.generateMenu)
    .then(style_1.generateStyles)
    .then(favicon_1.generateFavicon)
    .then(exports.contentPages)
    .then(tags_1.createTagPages)
    .then(sitemap_1.createSitemap)
    .then(() => {
    (0, cli_block_1.blockFooter)();
});
//# sourceMappingURL=index.js.map