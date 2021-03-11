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
exports.getProjectConfig = exports.download = exports.createFolder = exports.makeLink = exports.buildHtml = exports.getFiles = exports.getFileData = exports.getFileTree = void 0;
const path_1 = require("path");
const node_fetch_1 = __importDefault(require("node-fetch"));
const https_1 = __importDefault(require("https"));
const path_2 = require("path");
const fs_1 = require("fs");
const { readdir, readFile, mkdir } = require("fs").promises;
const pug_1 = __importDefault(require("pug"));
const date_fns_1 = require("date-fns");
const types_1 = require("../types");
const helpers_1 = require("./helpers");
/*
    ::getFileTree
    Get all files and folders from the input
*/
const getFileTree = (dir, filter = "") => __awaiter(void 0, void 0, void 0, function* () {
    // Do not search the following folders;
    const excludes = ["node_modules", ".git"];
    if (excludes.some((sub) => dir.includes(sub)))
        return;
    const direntGroup = yield readdir(dir, { withFileTypes: true });
    const files = yield Promise.all(direntGroup.map((dirent) => __awaiter(void 0, void 0, void 0, function* () {
        const result = path_1.resolve(dir, dirent.name);
        const extension = path_1.extname(result);
        const fileName = path_1.basename(result).replace(extension, "");
        const relativePath = result.replace(process.cwd(), "");
        const name = fileName == "index"
            ? relativePath.split("/")[relativePath.split("/").length - 2]
            : fileName;
        if (dirent.isDirectory() && dirent.name.indexOf("_") !== 0)
            return exports.getFileTree(result);
        else {
            const { birthtime } = fs_1.statSync(result);
            return {
                fileName,
                name: name.toLowerCase(),
                relativePath,
                created: birthtime,
                path: result,
                ext: extension,
            };
        }
    })));
    return Array.prototype
        .concat(...files)
        .filter((r) => r !== null)
        .filter((file) => file)
        .filter((file) => (filter ? file.ext == filter : true));
});
exports.getFileTree = getFileTree;
const getFileData = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield readFile(file.path).then((res) => res.toString());
    }
    catch (err) {
        throw Error(err);
    }
});
exports.getFileData = getFileData;
const getFiles = (dir, ext) => __awaiter(void 0, void 0, void 0, function* () {
    const fileTree = yield exports.getFileTree(dir, ext);
    const files = [];
    yield helpers_1.asyncForEach(fileTree, (file) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield exports.getFileData(file);
        if (file.fileName.indexOf("_") !== 0)
            files.push(Object.assign(Object.assign({}, file), { type: types_1.FileType.CONTENT, data, parent: file.relativePath.split("/")[file.relativePath.split("/").length - 2] }));
    }));
    return files;
});
exports.getFiles = getFiles;
const buildHtml = (file, args, template = "") => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, args), { name: file.name, title: file.title, content: file.html, meta: file.meta, pretty: true, children: file.children, type: file.type, formatDate: date_fns_1.format, removeTitle: helpers_1.removeTitle });
    const templatePath = path_1.join(__dirname, `../../src/${template ? template : "template/page.pug"}`);
    const html = pug_1.default.renderFile(templatePath, options);
    return html;
});
exports.buildHtml = buildHtml;
const makeLink = (path) => {
    const uri = path
        .replace(process.cwd(), "")
        .toLowerCase()
        .replace("readme", "index")
        .replace(".md", ".html");
    return uri.split("/")[uri.split("/").length - 1].replace(".html", "") !==
        "index"
        ? uri.replace(".html", "/index.html")
        : uri;
};
exports.makeLink = makeLink;
const createFolder = (folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mkdir(folder, { recursive: true }, () => {
            return;
        });
    }
    catch (err) {
        throw Error(err);
    }
});
exports.createFolder = createFolder;
const download = (url, destination) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.download = download;
const getProjectConfig = (meta) => {
    let project = {};
    // Merge configs
    Object.keys(meta).forEach((item) => {
        if (item.includes("project")) {
            const key = item.toLowerCase().replace("project", "");
            if (key == "ignore") {
                project[key] = [];
                meta[item].split(",").forEach((value) => {
                    project.ignore.push(value.trim());
                });
            }
            else
                project[key] = meta[item];
        }
    });
    return project;
};
exports.getProjectConfig = getProjectConfig;
//# sourceMappingURL=files.js.map