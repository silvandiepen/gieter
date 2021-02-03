"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBlog = void 0;
exports.buildBlog = (current, files) => {
    return files.filter((file) => file.parent == current.name && file.name !== file.parent);
    // children.forEach((child) => {
    //   console.log(child.title);
    // });
    // return "";
};
//# sourceMappingURL=blog.js.map