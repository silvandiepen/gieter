#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.media = exports.contentPages = exports.settingsAndConfig = exports.files = void 0;
const path_1 = require("path");
const cli_block_1 = require("cli-block");
const tools_1 = require("@sil/tools");
const args_1 = require("@sil/args");
const markdown_1 = require("./libs/markdown");
const helpers_1 = require("./libs/helpers");
const media_1 = require("./libs/media");
const partials_1 = require("./libs/partials");
const files_1 = require("./libs/files");
const project_1 = require("./libs/project");
const page_1 = require("./libs/page");
const tags_1 = require("./libs/tags");
const style_1 = require("./libs/buildStyle/style");
const menu_1 = require("./libs/menu");
const archives_1 = require("./libs/archives");
const favicon_1 = require("./libs/favicon");
const media_2 = require("./libs/media");
const language_1 = require("./libs/language");
const robots_1 = require("./libs/robots");
const PackageJson = require("../package.json");
/*
 * Files
 */
const files = async (payload) => {
    let files = await (0, files_1.getFiles)(process.cwd(), ".md");
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
    await (0, tools_1.asyncForEach)(files, async (file, index) => {
        const rendered = await (0, markdown_1.toHtml)(file.data).then((r) => r);
        files[index] = {
            ...file,
            html: rendered.document,
            meta: rendered.meta,
        };
    });
    const project = await (0, project_1.getProjectData)(files);
    /*
     * When the file is a "home" file, it gets certain privileges
     */
    await (0, tools_1.asyncForEach)(files, async (file, index) => {
        const relativePath = file.path.replace(process.cwd(), "");
        const pathGroup = relativePath.split("/");
        const thePath = pathGroup[pathGroup.length - 1].toLowerCase();
        const isHome = thePath.includes("readme") || thePath.includes("index");
        files[index].home = isHome ? isHome && file.meta.archive : false;
    });
    /*
     * Inherit Parent Metadata
     */
    await (0, tools_1.asyncForEach)(files, async (file, index) => {
        // const parentName =
        //   file.parent && file.name !== file.parent ? file.parent : "";
        // const parent = files.find((file) => file.name === parentName);
        const title = file.meta?.title ? file.meta.title : (0, helpers_1.fileTitle)(file);
        files[index].title = title.toString();
    });
    /*
     * Set the thumbnail for each file
     */
    await (0, tools_1.asyncForEach)(files, async (file, index) => {
        const thumbnail = (0, media_2.getThumbnail)(file);
        const thumbnailSvg = await (0, media_1.getSvgThumbnail)(thumbnail);
        files[index].thumbnail = thumbnail;
        files[index].thumbnailSvg = thumbnailSvg;
    });
    /*
     * Filter ignored files
    
     * Can't be done directly, due to that project Settings can be given on any file. So all files need to be indexed before
     * filtering can happen.
     */
    if (project?.ignore)
        files = files.filter((file) => !project.ignore.some((ignore) => file.path.includes(ignore)));
    /*
     * Logging
     */
    if (Object.keys(project).length) {
        (0, cli_block_1.blockMid)("Project settings");
        (0, cli_block_1.blockSettings)(project, {}, { exclude: ["logoData"] });
    }
    return {
        ...payload,
        files: files,
        project,
        languages,
    };
};
exports.files = files;
/*
 *  Settings
 */
const settingsAndConfig = async (payload) => {
    const args = (0, args_1.getArgs)();
    const config = await (0, project_1.getConfig)();
    const settings = {
        output: (0, path_1.join)(process.cwd(), "public"),
        languages: [],
        args,
        config,
    };
    return { ...payload, settings };
};
exports.settingsAndConfig = settingsAndConfig;
/*
 *  Build
 */
const contentPages = async (payload) => {
    if (payload.languages.length > 1) {
        // Create Content pages
        await (0, tools_1.asyncForEach)(payload.languages, async (language) => {
            (0, cli_block_1.blockMid)(`Pages ${(0, language_1.getLanguageName)(language)}`);
            await (0, tools_1.asyncForEach)(payload.files
                .filter((file) => file.language == language)
                .filter((file) => !file.name.startsWith("-")), // Don't pages that start with a -
            async (file) => await (0, page_1.createPage)(payload, file));
        });
    }
    else {
        (0, cli_block_1.blockMid)("Pages");
        await (0, tools_1.asyncForEach)(payload.files.filter((file) => !file.name.startsWith("-")), // Don't pages that start with a -
        async (file) => await (0, page_1.createPage)(payload, file));
    }
    return { ...payload };
};
exports.contentPages = contentPages;
const media = async (payload) => {
    const media = await (0, media_1.getMedia)(payload);
    const logo = await (0, media_1.getLogo)(payload, media);
    await (0, media_1.createThumbnails)(payload);
    await (0, media_1.copyToAssets)(payload);
    return { ...payload, media, logo };
};
exports.media = media;
const removeUrlParts = (payload) => {
    payload.files = payload.files.map((file) => {
        return {
            ...file,
            id: file.id.replace("-src-", "-"),
            relativePath: file.relativePath.replace("/src/", "/"),
            path: file.path.replace("/src/", "/"),
        };
    });
    return payload;
};
(0, tools_1.hello)()
    .then(exports.settingsAndConfig)
    .then((s) => {
    (0, cli_block_1.blockHeader)(`Gieter ${PackageJson.version}`);
    return s;
})
    .then((s) => {
    s.settings.args &&
        Object.keys(s.settings.args).length &&
        (0, cli_block_1.blockSettings)(s.settings.args);
    s.settings.config &&
        Object.keys(s.settings.config).length &&
        (0, cli_block_1.blockSettings)(s.settings.config);
    return s;
})
    .then(exports.files)
    .then(removeUrlParts)
    .then(partials_1.processPartials)
    .then(exports.media)
    .then(tags_1.generateTags)
    .then(archives_1.generateArchives)
    .then(menu_1.generateMenu)
    .then(style_1.generateStyles)
    .then(favicon_1.generateFavicon)
    .then(exports.contentPages)
    .then(tags_1.createTagPages)
    .then(robots_1.createRobots)
    .then(() => {
    (0, cli_block_1.blockFooter)();
});
//# sourceMappingURL=index.js.map