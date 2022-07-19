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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPage = exports.buildPage = void 0;
const { writeFile } = require("fs").promises;
const path_1 = require("path");
const cli_block_1 = require("cli-block");
const language_1 = require("../libs/language");
const media_1 = require("./media");
const files_1 = require("./files");
const system_1 = require("@sil/tools/dist/lib/system");
const style_1 = require("./style");
const kleur_1 = __importDefault(require("kleur"));
const media_2 = require("./media");
const const_1 = require("../const");
const simplifyUrl = (url) => url.replace("/index.html", "");
const isActiveMenu = (link, current) => simplifyUrl(link) == simplifyUrl(current);
const isActiveMenuParent = (link, current) => simplifyUrl(current).includes(simplifyUrl(link)) &&
    simplifyUrl(current) !== "" &&
    simplifyUrl(link) !== "";
const hasTable = (file) => file.html && file.html.includes("<table>");
const hasUrlToken = (file) => file.html && file.html.includes('<span class="token url">http');
const hasHeader = (menu) => menu.length > 0;
const hasColors = (file) => file.html && !!file.html.match(/#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}/i);
const subtitle = (file, payload) => {
    if (!file.home) {
        const parent = (0, files_1.getParentFile)(file, payload.files);
        return (parent === null || parent === void 0 ? void 0 : parent.title) || "";
    }
    else {
        return "";
    }
};
const getTags = (payload, file) => {
    var _a;
    return ((_a = file.parent) === null || _a === void 0 ? void 0 : _a.id)
        ? payload.tags.filter((tag) => tag.parent.id === file.parent.id)
        : [];
};
const homeLink = (file) => file.language == language_1.defaultLanguage ? "/" : `/${file.language}`;
var BackgroundLocation;
(function (BackgroundLocation) {
    BackgroundLocation["BODY"] = "body";
    BackgroundLocation["SECTION"] = "section";
})(BackgroundLocation || (BackgroundLocation = {}));
const getBackground = (file, location) => {
    console.log(file.meta.bodyBackground, (0, media_1.getImagePath)(file.meta.bodyBackground, const_1.MEDIA_SIZE_NAME.LARGE));
    switch (location) {
        case BackgroundLocation.BODY:
            return file.meta.bodyBackground
                ? `background-image: url(${(0, media_1.getImagePath)(file.meta.bodyBackground, const_1.MEDIA_SIZE_NAME.LARGE)})`
                : null;
        case BackgroundLocation.SECTION:
            return file.meta.sectionBackground
                ? `background-image: url(${(0, media_1.getImagePath)(file.meta.sectionBackground, const_1.MEDIA_SIZE_NAME.LARGE)})`
                : null;
        default:
            return null;
    }
};
const buildPage = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currentLink = (0, files_1.makePath)(file);
    const currentLanguage = file.language;
    /*
     * Generate the html for this page
     */
    const menuStatus = (menu) => {
        if (menu) {
            return menu
                .map((item) => (Object.assign(Object.assign({}, item), { current: isActiveMenu(item.link, currentLink), isParent: isActiveMenuParent(item.link, currentLink), children: menuStatus(item.children) })))
                .filter((item) => item.language == currentLanguage);
        }
        else {
            return [];
        }
    };
    const menu = payload.menu ? menuStatus(payload.menu) : [];
    const data = {
        menu,
        tags: getTags(payload, file),
        thumbnail: (0, media_2.getThumbnail)(file),
        style: Object.assign(Object.assign({}, payload.style), { page: currentLink.replace(".html", ".css") }),
        project: payload.project,
        media: payload.media,
        logo: payload.logo,
        favicon: payload.favicon,
        meta: file.meta,
        contentOnly: false,
        showContentImage: ((_a = file.meta) === null || _a === void 0 ? void 0 : _a.image) && file.meta.type !== "photo",
        homeLink: homeLink(file),
        langMenu: (0, language_1.getLanguageMenu)(payload, file),
        language: currentLanguage,
        subtitle: subtitle(file, payload),
        shop: payload.shop,
        has: Object.assign(Object.assign({}, payload.has), { archive: !!file.archive, menu: !!menu.length, table: hasTable(file), header: hasHeader(menu), urlToken: hasUrlToken(file), colors: hasColors(file) }),
        background: {
            body: getBackground(file, BackgroundLocation.BODY),
            section: getBackground(file, BackgroundLocation.SECTION),
        },
    };
    const html = yield (0, files_1.buildHtml)(file, data);
    /*
     * Generate the custom CSS for this page
     */
    const customCssFilePath = (0, path_1.join)(payload.settings.output, currentLink).replace(".html", ".css");
    const customHtml = yield (0, files_1.buildHtml)(file, Object.assign(Object.assign({}, data), { contentOnly: true }), "template/content.pug");
    const customCss = yield (0, style_1.createCss)(customHtml, payload.style.og);
    /*
     * Return the page
     */
    return {
        dir: (0, path_1.join)(payload.settings.output, currentLink.split("/").slice(0, -1).join("/")),
        css: {
            data: customCss,
            file: customCssFilePath,
        },
        html: {
            data: html,
            file: (0, path_1.join)(payload.settings.output, currentLink),
        },
        name: file.name,
        link: currentLink,
    };
});
exports.buildPage = buildPage;
const createPage = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const page = yield (0, exports.buildPage)(payload, file);
    yield (0, system_1.createDir)(page.dir);
    try {
        yield writeFile(page.html.file, page.html.data);
        yield writeFile(page.css.file, page.css.data);
        (0, cli_block_1.blockLineSuccess)(`${page.name}`);
        (0, cli_block_1.blockLine)(kleur_1.default.blue(`   ${page.link.replace("/index.html", "")}`));
    }
    catch (err) {
        throw Error(err);
    }
});
exports.createPage = createPage;
//# sourceMappingURL=page.js.map