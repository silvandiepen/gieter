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
exports.generateArchives = void 0;
const files_1 = require("./files");
/*
 *  Archives
 */
const generateArchives = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.files = payload.files
        // Map all Archive parents and get their children
        .map((file) => {
        let children = [];
        if (file.home) {
            children = payload.files
                .filter((item) => item.parent == file.name && !item.home)
                //  Enrich each child with meta information and a link
                .map((item) => {
                var _a;
                return ({
                    title: item.title,
                    created: ((_a = item === null || item === void 0 ? void 0 : item.meta) === null || _a === void 0 ? void 0 : _a.date) || item.created,
                    meta: Object.assign(Object.assign({}, item.meta), { hide: true }),
                    link: files_1.makeLink(item.path),
                    parent: item.parent,
                });
            })
                .sort((a, b) => b.created - a.created);
        }
        return Object.assign(Object.assign({}, file), { children });
    });
    return payload;
});
exports.generateArchives = generateArchives;
//# sourceMappingURL=archives.js.map