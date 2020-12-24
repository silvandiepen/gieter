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
exports.download = exports.createFolder = exports.makePath = exports.buildHtml = exports.fileTitle = exports.getFiles = exports.getFileData = exports.getFileTree = void 0;
const path_1 = require("path");
const helpers_1 = require("./helpers");
const pug_1 = __importDefault(require("pug"));
const date_fns_1 = require("date-fns");
const node_fetch_1 = __importDefault(require("node-fetch"));
const https_1 = __importDefault(require("https"));
const path_2 = require("path");
const fs_1 = require("fs");
const { readdir, readFile, mkdir } = require("fs").promises;
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
exports.fileTitle = (file) => {
    const matches = /<h1>(.+?)<\/h1>/gi.exec(file.html.document);
    return matches && matches[1] ? matches[1] : file.name;
};
exports.buildHtml = (file, menu, style) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const options = {
        title: ((_a = file.html.meta) === null || _a === void 0 ? void 0 : _a.title) ? file.html.meta.title : exports.fileTitle(file),
        content: file.html.document,
        meta: file.html.meta,
        style: false,
        menu,
        pretty: true,
        formatDate: date_fns_1.format,
    };
    const html = pug_1.default.renderFile(path_1.join(__dirname, "../../src/template.pug"), options);
    return html;
});
exports.makePath = (path) => path
    .replace(process.cwd(), "")
    .replace("readme", "index")
    .replace("README", "index")
    .replace("Readme", "index")
    .replace(".md", ".html");
exports.createFolder = (folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mkdir(folder, { recursive: true }, () => {
            return;
        });
    }
    catch (err) {
        throw Error(err);
    }
});
exports.download = (url, destination) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = new https_1.default.Agent({
        rejectUnauthorized: false,
    });
    //@ts-ignore
    const res = yield node_fetch_1.default(url, { agent });
    yield exports.createFolder(path_2.dirname(destination));
    yield new Promise((resolve, reject) => {
        var _a, _b;
        const fileStream = fs_1.createWriteStream(destination);
        (_a = res.body) === null || _a === void 0 ? void 0 : _a.pipe(fileStream);
        (_b = res.body) === null || _b === void 0 ? void 0 : _b.on("error", (err) => {
            reject(err);
        });
        fileStream.on("finish", () => {
            //@ts-ignore
            resolve();
        });
    });
});
//# sourceMappingURL=files.js.map