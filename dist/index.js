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
exports.media = exports.tagPages = exports.contentPages = exports.tags = exports.archives = exports.menu = exports.styles = exports.settings = exports.files = void 0;
const { readFile, writeFile } = require("fs").promises;
const { existsSync } = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const log = __importStar(require("cli-block"));
const markdown_1 = require("./libs/markdown");
const helpers_1 = require("./libs/helpers");
const files_1 = require("./libs/files");
const svg_1 = require("./libs/svg");
const page_1 = require("./libs/page");
/*
 * Files
 */
exports.files = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let files = yield files_1.getFiles(process.cwd(), ".md");
    let project = {};
    yield helpers_1.asyncForEach(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        // Compile file to html
        const rendered = yield markdown_1.toHtml(file.data).then((r) => r);
        files[index] = Object.assign(Object.assign({}, file), { html: rendered.document, meta: rendered.meta });
        const projectMeta = files_1.getProjectConfig(rendered.meta);
        Object.keys(projectMeta).forEach((key) => {
            if (!project[key])
                project[key] = projectMeta[key];
        });
    }));
    // Inherit Parent Metadata
    yield helpers_1.asyncForEach(files, (file, index) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const parentName = file.parent && file.name !== file.parent ? file.parent : "";
        const parent = files.find((file) => file.name === parentName);
        files[index].title = ((_a = file.meta) === null || _a === void 0 ? void 0 : _a.title) ? file.meta.title : helpers_1.fileTitle(file);
    }));
    // Filter files
    if (project === null || project === void 0 ? void 0 : project.ignore)
        files = files.filter((file) => !project.ignore.some((ignore) => file.path.includes(ignore)));
    if ((project === null || project === void 0 ? void 0 : project.logo) && (project === null || project === void 0 ? void 0 : project.logo.includes(".svg"))) {
        const logoData = yield files_1.getFileData({
            name: "",
            fileName: "",
            created: null,
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
 *  Settings
 */
exports.settings = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = {
        output: path_1.join(process.cwd(), "public"),
    };
    return Object.assign(Object.assign({}, payload), { settings });
});
/*
 * Styles
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
        let active = file.meta.hide !== "true" || file.meta.hide;
        if (file.parent !== file.name)
            active = false;
        return {
            name: file.title,
            link: files_1.makeLink(file.path),
            active,
        };
    })
        .filter((item) => item.active);
    log.BLOCK_MID("Navigation");
    let menuItems = {};
    if (menu.length > 1)
        menu.forEach((item) => {
            menuItems[item.name] = item.link;
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
 *  Archives
 */
exports.archives = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.files = payload.files
        // Map all Archive parents and get their children
        .map((file) => {
        let children = [];
        if (file.parent == file.name) {
            children = payload.files
                .filter((item) => item.parent == file.name && item.parent !== item.name)
                // //  Enrich each child with meta information and a link
                .map((item) => (Object.assign(Object.assign({}, item), { meta: Object.assign(Object.assign({}, item.meta), { hide: true }), link: files_1.makeLink(item.path) })));
        }
        return Object.assign(Object.assign({}, file), { children });
    });
    return payload;
});
/*
 *  Tags
 */
exports.tags = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = [];
    yield helpers_1.asyncForEach(payload.files, (file) => {
        var _a;
        if (file.meta.tags) {
            for (let i = 0; i < file.meta.tags.length; i++) {
                let parent = payload.files.find((f) => f.name == file.parent);
                let tag = {
                    name: file.meta.tags[i],
                    parent: file.parent,
                    type: (_a = parent.meta) === null || _a === void 0 ? void 0 : _a.type,
                };
                if (!tags.includes(tag))
                    tags.push(tag);
            }
        }
    });
    return Object.assign(Object.assign({}, payload), { tags });
});
/*
 *  Build
 */
exports.contentPages = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    log.BLOCK_MID("Pages");
    yield helpers_1.asyncForEach(payload.files, (file) => __awaiter(void 0, void 0, void 0, function* () { return yield page_1.createPage(payload, file); }));
    return Object.assign({}, payload);
});
exports.tagPages = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    log.BLOCK_MID("Tag pages");
    yield helpers_1.asyncForEach(payload.tags, (tag) => __awaiter(void 0, void 0, void 0, function* () {
        const file = {
            name: tag.name,
            title: `#${tag.name}`,
            path: `tag/${tag.name}/index.html`,
            created: new Date(),
            fileName: "index.html",
            meta: { type: tag.type },
            children: payload.files.filter((file) => { var _a, _b; return ((_b = (_a = file.meta) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.includes(tag.name)) && file.parent == tag.parent; }),
            html: `${tag.parent}`,
        };
        yield page_1.createPage(payload, file);
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
    .then(exports.tags)
    .then(exports.archives)
    .then(exports.menu)
    .then(exports.contentPages)
    .then(exports.tagPages)
    .then(() => {
    log.BLOCK_END();
});
//# sourceMappingURL=index.js.map