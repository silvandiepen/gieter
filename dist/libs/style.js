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
exports.generateStyles = exports.createBaseCss = exports.createCss = void 0;
const purgecss_1 = require("purgecss");
const types_1 = require("../types");
const page_1 = require("./page");
const files_1 = require("./files");
const helpers_1 = require("./helpers");
const { readFile, writeFile } = require("fs").promises;
const path_1 = require("path");
/*
 * createCss
 *
 * Create CSS string based on Original input and HTML file.
 */
const createCss = (content, css, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const purgeCSSResult = yield new purgecss_1.PurgeCSS().purge(Object.assign({ content: [
            {
                raw: content,
                extension: "html",
            },
        ], css: [{ raw: css }], fontFace: true, keyframes: true, variables: true }, options));
    return purgeCSSResult[0].css;
});
exports.createCss = createCss;
/*
 * createBaseCss
 *
 * Create a base CSS based on an empty page. This CSS is automatically applied to all pages.
 */
const createBaseCss = (payload, css) => __awaiter(void 0, void 0, void 0, function* () {
    // If there is a menu, enrich the menu with active and parent items so these will be picked up by purgeCss
    const mockMenu = [...payload.menu];
    if (mockMenu.length > 0) {
        const ph = {
            name: "placeholder",
            active: true,
        };
        mockMenu.push(Object.assign(Object.assign({}, ph), { link: "parent", language: types_1.Language.EN }), Object.assign(Object.assign({}, ph), { link: "parent/child", language: types_1.Language.EN }));
    }
    const emptyFile = {
        id: "",
        name: "",
        fileName: "",
        path: "parent/child",
        created: new Date(),
        language: types_1.Language.EN,
        title: "",
        html: null,
        meta: {},
        archive: [],
    };
    const customHtml = yield page_1.buildPage(Object.assign(Object.assign({}, payload), { menu: mockMenu, style: { og: "" } }), emptyFile);
    const customCss = yield exports.createCss(customHtml.html.data, css, {
        whitelistPatternsChildren: [/$__item/],
    });
    return customCss;
});
exports.createBaseCss = createBaseCss;
/*
 * generateStyles
 *
 * Styles are being downloaded and directly the base css is being generated.
 * generateStyles responds with loading the payload with the original styles and possible custom or additional styles.
 */
const generateStyles = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Download the style
    let style = {};
    yield files_1.download("https://stil.style/default.css", path_1.join(__dirname, "../dist/style.css"));
    const styleData = yield readFile(path_1.join(__dirname, "../dist/style.css")).then((res) => res.toString());
    const customCss = yield exports.createBaseCss(payload, styleData);
    if (payload.files.length > 1) {
        yield helpers_1.createDir(payload.settings.output);
        const filePath = path_1.join(payload.settings.output, "style.css");
        yield writeFile(filePath, customCss);
        style.path = "/style.css";
    }
    else {
        style.sheet = customCss;
    }
    style.og = styleData;
    if (payload.project.styleOverrule)
        style.path = payload.project.styleOverrule;
    if (payload.project.style)
        style.add = payload.project.style;
    return Object.assign(Object.assign({}, payload), { style });
});
exports.generateStyles = generateStyles;
//# sourceMappingURL=style.js.map