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
exports.fileTitle = exports.getTitle = exports.removeTitle = exports.hello = exports.createDir = exports.nthIndex = exports.getIndexes = exports.asyncForEach = void 0;
const fs_1 = require("fs");
const { mkdir } = require("fs").promises;
const asyncForEach = (array, callback) => __awaiter(void 0, void 0, void 0, function* () {
    for (let index = 0; index < array.length; index++) {
        yield callback(array[index], index, array);
    }
});
exports.asyncForEach = asyncForEach;
const getIndexes = (source, find) => {
    const result = [];
    let i = 0;
    while (i < source.length) {
        if (source.substring(i, i + find.length) === find) {
            result.push(i);
            i += find.length;
        }
        else {
            i++;
        }
    }
    return result;
};
exports.getIndexes = getIndexes;
const nthIndex = (source, find, nth) => {
    const result = exports.getIndexes(source, find);
    return result[nth];
};
exports.nthIndex = nthIndex;
const createDir = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        !fs_1.existsSync(dir) && (yield mkdir(dir, { recursive: true }));
    }
    catch (error) {
        console.error(error);
    }
});
exports.createDir = createDir;
const hello = (args = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return args;
});
exports.hello = hello;
const removeTitle = (input) => input.replace(/\<h1(.*)\>(.*)\<\/h1\>/gi, "");
exports.removeTitle = removeTitle;
const getTitle = (input) => {
    const matches = /<h1(.*?)>(.+?)<\/h1>/gi.exec(input);
    if (!matches)
        return "";
    return matches[matches.length - 1];
};
exports.getTitle = getTitle;
const fileTitle = (file) => exports.getTitle(file.html) || file.name;
exports.fileTitle = fileTitle;
//# sourceMappingURL=helpers.js.map