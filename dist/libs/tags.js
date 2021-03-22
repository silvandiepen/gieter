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
exports.createTagPages = exports.generateTags = void 0;
const helpers_1 = require("./helpers");
const types_1 = require("../types");
const page_1 = require("./page");
const files_1 = require("./files");
const log = __importStar(require("cli-block"));
/*
 *  Tags
 */
const generateTags = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = [];
    yield helpers_1.asyncForEach(payload.files, (file) => {
        var _a;
        if (file.meta && ((_a = file.meta) === null || _a === void 0 ? void 0 : _a.tags)) {
            for (let i = 0; i < file.meta.tags.length; i++) {
                let parent = payload.files.find((f) => f.name == file.parent);
                let tag = {
                    name: file.meta.tags[i],
                    parent: file.parent,
                    type: (parent === null || parent === void 0 ? void 0 : parent.meta.type) || "",
                };
                if (!tags.some((item) => item.name === tag.name && item.parent === tag.parent))
                    tags.push(tag);
            }
        }
    });
    return Object.assign(Object.assign({}, payload), { tags });
});
exports.generateTags = generateTags;
const createTagPages = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.tags.length)
        log.BLOCK_MID("Tag pages");
    yield helpers_1.asyncForEach(payload.tags, (tag) => __awaiter(void 0, void 0, void 0, function* () {
        let path = `/tag/${tag.parent}/${tag.name}/index.html`;
        const file = {
            id: files_1.fileId(path),
            name: tag.name,
            title: `#${tag.name}`,
            path,
            created: new Date(),
            language: types_1.Language.EN,
            fileName: "index.html",
            parent: tag.parent,
            meta: { type: tag.type },
            archives: [
                {
                    name: tag.name,
                    type: "",
                    children: payload.files.filter((file) => { var _a, _b; return ((_b = (_a = file.meta) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.includes(tag.name)) && file.parent == tag.parent; }),
                },
            ],
            html: `<h1>#${tag.name}</h1>`,
            type: types_1.FileType.TAG,
        };
        yield page_1.createPage(payload, file);
    }));
    return Object.assign({}, payload);
});
exports.createTagPages = createTagPages;
//# sourceMappingURL=tags.js.map