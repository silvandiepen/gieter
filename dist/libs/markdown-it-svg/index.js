"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const files_1 = require("../files");
const fs_1 = require("fs");
function generateAttributes(md, token) {
    var ignore = ["src", "alt"];
    var escape = ["title"];
    var attributes = "";
    token.attrs.forEach((entry) => {
        var name = entry[0];
        if (ignore.includes(name))
            return;
        var value = "";
        if (escape.includes(name)) {
            value = md.utils.escapeHtml(entry[1]);
        }
        else {
            value = entry[1];
        }
        attributes += ` ${name}="${value}"`;
    });
    return attributes;
}
const generateClass = (className) => className ? ' class="' + className + '"' : "";
const isLocal = (url) => {
    const pattern = /^https?:\/\//i;
    return pattern.test(url);
};
const loadSvg = (url) => {
    try {
        const data = fs_1.readFileSync(url, "utf8");
        return data;
    }
    catch (err) {
        console.error(err);
    }
    return "";
};
const getImage = (url) => {
    let svg = "";
    if (isLocal(url)) {
        let tempFile = path_1.join(process.cwd(), "temp/image.svg");
        files_1.download(url, tempFile);
        svg = loadSvg(tempFile);
    }
    else {
        svg = loadSvg(path_1.join(process.cwd(), url));
    }
    return svg;
};
const svgImages = (md, config) => {
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const localConfig = Object.assign({}, config);
        const token = tokens[idx];
        const srcIndex = token.attrIndex("src");
        const url = token.attrs[srcIndex][1];
        const caption = md.utils.escapeHtml(token.content);
        const isSvg = url.indexOf(".svg") >= url.length - 5;
        const imgClass = generateClass(localConfig.imgClass);
        const otherAttributes = generateAttributes(md, token);
        if (!isSvg) {
            return `<img src="${url}" alt="${caption}" ${imgClass} ${otherAttributes}>`;
        }
        else {
            const svg = getImage(url);
            return svg ? svg : "";
        }
    };
};
exports.default = svgImages;
//# sourceMappingURL=index.js.map