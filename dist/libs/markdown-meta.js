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
exports.removeMeta = exports.extractMeta = void 0;
const helpers_1 = require("./helpers");
exports.extractMeta = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const startLine = helpers_1.nthIndex(input, "---", 0);
    const endLine = helpers_1.nthIndex(input, "---", 1);
    const meta = {};
    if (startLine > -1 && startLine < 10 && endLine > -1) {
        input
            .substring(startLine + 3, endLine)
            .split("\n")
            .filter((v) => v !== "")
            .map((v) => {
            if (v.indexOf(":") > -1) {
                const valueArray = v.split(":");
                // Get the key
                const key = valueArray[0].trim().replace(" ", "_");
                // Set the default string value;
                let value = valueArray[1].trim();
                // If the value is a number, convert to a number
                if (!isNaN(value))
                    value = parseInt(value, 10);
                // If the value has commas, convert it to an array
                if (typeof value === "string" && value.indexOf(",") > -1)
                    value = value.split(",").map((val) => val.trim());
                // If they key has date in the name, auto convert to a date.
                if (key.toLowerCase().indexOf("date") > -1)
                    value = new Date(value);
                // Set the meta data;
                meta[key] = value;
            }
        });
        return meta;
    }
    return meta;
});
exports.removeMeta = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const startLine = helpers_1.nthIndex(input, "---", 0);
    const endLine = helpers_1.nthIndex(input, "---", 1);
    if (endLine > -1 && startLine < 10)
        return input.substring(endLine + 3, input.length);
    else
        return input.trim();
});
//# sourceMappingURL=markdown-meta.js.map