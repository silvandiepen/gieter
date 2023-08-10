"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPage = exports.buildPage = void 0;
const { writeFile } = require("fs").promises;
const path_1 = require("path");
const cli_block_1 = require("cli-block");
const kleur_1 = __importDefault(require("kleur"));
const language_1 = require("../libs/language");
const files_1 = require("./files");
const tools_1 = require("../libs/tools");
const media_1 = require("./media");
const webcomponents_1 = require("./webcomponents");
const simplifyUrl = (url) => url.replace("/index.html", "");
const isActiveMenu = (link, current) => simplifyUrl(link) == simplifyUrl(current);
const isActiveMenuParent = (link, current) => simplifyUrl(current).includes(simplifyUrl(link)) &&
    simplifyUrl(current) !== "" &&
    simplifyUrl(link) !== "";
const hasTable = (file) => file.html && file.html.includes("<table>");
const hasUrlToken = (file) => file.html && file.html.includes('<span class="token url">http');
const hasHeader = (menu) => menu.length > 0;
const hasColors = (file) => file.html && !!file.html.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/i);
const hasLanguages = (languages) => !!(languages.length > 1);
const subtitle = (file, payload) => {
    if (!file.home) {
        const parent = (0, files_1.getParentFile)(file, payload.files);
        return parent?.title || "";
    }
    else {
        return "";
    }
};
const getProjectByLanguage = (project, language) => {
    const langProject = {};
    Object.entries(project).filter((value) => {
        if (value[0].includes(":")) {
            if (value[0].includes(`:${language}`)) {
                langProject[value[0].split(":")[0]] = value[1];
            }
        }
        else {
            langProject[value[0]] = value[1];
        }
    });
    return langProject;
};
const buildPage = async (payload, file) => {
    const currentLink = (0, files_1.makePath)(file);
    const currentLanguage = file.language;
    /*
     * Generate the html for this page
     */
    const menuStatus = (menu) => {
        if (menu) {
            return menu
                .map((item) => ({
                ...item,
                current: isActiveMenu(item.link, currentLink),
                isParent: isActiveMenuParent(item.link, currentLink),
                children: menuStatus(item.children),
            }))
                .filter((item) => item.language == currentLanguage);
        }
        else {
            return [];
        }
    };
    const menu = payload.menu ? menuStatus(payload.menu) : [];
    const project = getProjectByLanguage(payload.project, currentLanguage);
    const favicons = payload.favicons;
    const tags = payload.tags
        ? payload.tags.filter((tag) => tag.parent == file.parent)
        : [];
    const style = {
        ...payload.style,
        page: currentLink.replace(".html", ".css"),
    };
    const data = {
        menu,
        tags,
        thumbnail: (0, media_1.getThumbnail)(file),
        project,
        style,
        favicons,
        media: payload.media,
        logo: payload.logo,
        meta: file.meta,
        contentOnly: false,
        showContentImage: file.meta?.image && file.meta.type !== "photo",
        homeLink: file.language == (0, language_1.getDefaultLanguage)() ? "/" : `/${file.language}`,
        langMenu: (0, language_1.getLanguageMenu)(payload, file),
        language: currentLanguage,
        subtitle: subtitle(file, payload),
        components: [],
        socials: payload.socials,
        config: payload.settings.config,
        has: {
            table: hasTable(file),
            header: hasHeader(menu),
            urlToken: hasUrlToken(file),
            colors: hasColors(file),
            languages: hasLanguages(payload.languages),
        },
    };
    // Prerender before actual render
    const prerender = await (0, files_1.buildHtml)(file, data);
    data.components = await (0, webcomponents_1.findWebComponents)(prerender);
    // Render final html
    const html = await (0, files_1.buildHtml)(file, data);
    /*
     * Generate the custom CSS for this page
     */
    const customCssFilePath = (0, path_1.join)(payload.settings.output, currentLink).replace(".html", ".css");
    const customHtml = await (0, files_1.buildHtml)(file, {
        ...data,
        contentOnly: true,
    }, "template/content.pug");
    // const customCss = await createCss(customHtml, payload.style.og);
    /*
     * Return the page
     */
    return {
        dir: (0, path_1.join)(payload.settings.output, currentLink.split("/").slice(0, -1).join("/")),
        css: {
            data: '',
            file: customCssFilePath,
        },
        html: {
            data: html,
            file: (0, path_1.join)(payload.settings.output, currentLink),
        },
        name: file.name,
        link: currentLink,
        title: file.title,
    };
};
exports.buildPage = buildPage;
const createPage = async (payload, file) => {
    const page = await (0, exports.buildPage)(payload, file);
    await (0, tools_1.createDir)(page.dir);
    try {
        await writeFile(page.html.file, page.html.data);
        await writeFile(page.css.file, page.css.data);
        (0, cli_block_1.blockLineSuccess)(`${page.title}`);
        (0, cli_block_1.blockLine)(kleur_1.default.blue(`   ${page.link.replace("/index.html", "")}`));
        if (file.archives) {
            file.archives.forEach((f) => {
                (0, cli_block_1.blockLine)(`   Archive`);
                f.children.forEach((c) => {
                    (0, cli_block_1.blockLine)(`   - ${c.title}`);
                });
            });
        }
    }
    catch (err) {
        throw Error(err);
    }
};
exports.createPage = createPage;
//# sourceMappingURL=page.js.map