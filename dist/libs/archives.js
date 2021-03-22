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
exports.getArchives = exports.generateArchives = void 0;
const files_1 = require("./files");
/*
 *  Archives
 */
const parentPath = (path) => path.split("/").slice(0, -1).join("/");
const generateArchives = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.files = payload.files
        // Map all Archive parents and get their children
        .map((file, index) => {
        let archiveName = file.name;
        let archiveType = file.meta.type;
        let children = [];
        if (file.home && file.meta.isArchive) {
            children = payload.files
                .filter((item) => item.parent == file.parent && !item.home)
                //  Enrich each child with meta information and a link
                .map((item) => {
                var _a, _b;
                return ({
                    title: item.title,
                    date: (_a = item === null || item === void 0 ? void 0 : item.meta) === null || _a === void 0 ? void 0 : _a.date,
                    created: ((_b = item === null || item === void 0 ? void 0 : item.meta) === null || _b === void 0 ? void 0 : _b.date) || item.created,
                    meta: Object.assign(Object.assign({}, item.meta), { hide: true }),
                    link: files_1.makePath(item, payload),
                    parent: item.parent,
                });
            })
                .sort((a, b) => b.created - a.created);
        }
        else {
            /*
             * Inherit the parents type on each child
             */
            if (file.parent && !file.meta.type) {
                let parent = payload.files.find((parentFile) => {
                    if (!parentFile.home)
                        return false;
                    return (parentFile.path.toLowerCase() ==
                        (parentPath(file.path) + "/readme.md").toLowerCase());
                });
                if ((parent === null || parent === void 0 ? void 0 : parent.meta) && parent.meta.type)
                    if (file === null || file === void 0 ? void 0 : file.meta)
                        payload.files[index].meta = Object.assign(Object.assign({}, file.meta), { type: parent.meta.type });
                    else
                        payload.files[index].meta = { type: parent.meta.type };
            }
        }
        return Object.assign(Object.assign({}, file), { archives: children.length
                ? [{ name: archiveName, type: archiveType, children }]
                : [] });
    });
    return payload;
});
exports.generateArchives = generateArchives;
const getArchives = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    payload.files = payload.files.map((file, index) => {
        if (file.meta.showArchive) {
            let children = [];
            return Object.assign({}, file);
        }
        else {
            return file;
        }
    });
    return payload;
});
exports.getArchives = getArchives;
//# sourceMappingURL=archives.js.map