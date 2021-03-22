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
exports.generateMenu = void 0;
const log = __importStar(require("cli-block"));
const files_1 = require("./files");
const generateMenu = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let menu = payload.files
        .map((file) => {
        let active = file.meta.hide !== "true" || file.meta.hide;
        const relativePath = file.path.replace(process.cwd(), "");
        const pathGroup = relativePath.split("/");
        const depth = pathGroup.length - 2;
        // Only items from the main depth should be in the menu
        if (depth > 0)
            active = false;
        // Index in first depth can also be in menu
        if (depth === 1 && file.home)
            active = true;
        return {
            name: file.title,
            link: files_1.makePath(file),
            active,
            language: file.language,
        };
    })
        .filter((item) => item.active);
    log.BLOCK_MID("Navigation");
    let menuItems = {};
    if (menu.length > 1)
        menu.forEach((item) => {
            menuItems[item.name] = item.link;
        });
    if (menu.length < 2) {
        yield log.BLOCK_LINE("No menu");
        menu = [];
    }
    else
        yield log.BLOCK_SETTINGS(menuItems);
    return Object.assign(Object.assign({}, payload), { menu });
});
exports.generateMenu = generateMenu;
//# sourceMappingURL=menu.js.map