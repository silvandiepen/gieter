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
exports.buildHtml = exports.getFiles = exports.getFileData = exports.getFileTree = void 0;
const path_1 = require("path");
const helpers_1 = require("./helpers");
const pug_1 = __importDefault(require("pug"));
const { readdir, readFile } = require("fs").promises;
/*
    ::getFileTree
    Get all files and folders from the input
*/
exports.getFileTree = (dir, filter = "") => __awaiter(void 0, void 0, void 0, function* () {
    // Do not search the following folders;
    const excludes = ["node_modules", ".git"];
    if (excludes.some((sub) => dir.includes(sub)))
        return;
    const direntGroup = yield readdir(dir, { withFileTypes: true });
    const files = yield Promise.all(direntGroup.map((dirent) => __awaiter(void 0, void 0, void 0, function* () {
        const res = path_1.resolve(dir, dirent.name);
        const ext = path_1.extname(res);
        return dirent.isDirectory()
            ? exports.getFileTree(res)
            : {
                name: path_1.basename(res).replace(ext, ""),
                path: res,
                ext: ext,
            };
    })));
    return Array.prototype
        .concat(...files)
        .filter((r) => r !== null)
        .filter((file) => file)
        .filter((file) => (filter ? file.ext == filter : true));
});
exports.getFileData = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield readFile(file.path).then((res) => res.toString());
    }
    catch (err) {
        throw Error(err);
    }
});
exports.getFiles = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    const fileTree = yield exports.getFileTree(dir, ".md");
    const files = [];
    yield helpers_1.asyncForEach(fileTree, (file) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield exports.getFileData(file);
        files.push(Object.assign(Object.assign({}, file), { data }));
    }));
    return files;
});
exports.buildHtml = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const style = yield readFile(path_1.join(process.cwd(), "dist/style.css")).then((res) => res.toString());
    const options = {
        title: "Testje",
        content: file.html,
        style,
        pretty: true,
    };
    const html = pug_1.default.renderFile(path_1.join(__dirname, "../../src/template.pug"), options);
    return html;
});
//# sourceMappingURL=files.js.map