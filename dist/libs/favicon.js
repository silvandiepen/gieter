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
exports.generateFavicon = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const iconator_1 = __importDefault(require("iconator"));
const generateFavicon = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let favicon = "";
    const iconPath = path_1.join(process.cwd(), "/assets/");
    if (fs_1.existsSync(path_1.join(iconPath, "favicon.png")))
        favicon = "assets/favicon.png";
    else if (fs_1.existsSync(path_1.join(iconPath, "logo.png")))
        favicon = "assets/logo.png";
    if (favicon)
        yield iconator_1.default({
            input: favicon,
            output: "public/assets/favicon",
            logging: ["inline", "minimal"],
            sets: ["favicons"],
            //   meta: ["none"],
        });
    return Object.assign(Object.assign({}, payload), { favicon });
});
exports.generateFavicon = generateFavicon;
//# sourceMappingURL=favicon.js.map