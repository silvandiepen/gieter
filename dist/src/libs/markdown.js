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
exports.toHtml = void 0;
const MarkdownIt = require("markdown-it");
const markdown_it_emoji_1 = __importDefault(require("markdown-it-emoji"));
const markdown_it_prism_1 = __importDefault(require("markdown-it-prism"));
const markdown_it_anchor_1 = __importDefault(require("markdown-it-anchor"));
const markdown_meta_1 = require("./markdown-meta");
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
});
md.use(markdown_it_prism_1.default);
md.use(markdown_it_emoji_1.default);
md.use(markdown_it_anchor_1.default);
exports.toHtml = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const metaData = yield markdown_meta_1.extractMeta(input);
    const strippedData = yield markdown_meta_1.removeMeta(input);
    const renderedDocument = md.render(strippedData);
    return {
        document: renderedDocument,
        meta: metaData,
    };
});
//# sourceMappingURL=markdown.js.map