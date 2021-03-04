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
const markdown_meta_1 = require("./markdown-meta");
describe("Extract Metadata", () => {
    it("Extract simple string", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: string
            ---
        `;
        const output = {
            test: "string",
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
    it("Extract multiple string", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: string
            second: value
            ---
        `;
        const output = {
            test: "string",
            second: "value",
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
    it("Extract number", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: 3
            ---
        `;
        const output = {
            test: 3,
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
    it("Extract number and string", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: 3
            test2: value
            ---
        `;
        const output = {
            test: 3,
            test2: "value",
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
    it("Extract an array", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: one,two,three,four
            ---
        `;
        const output = {
            test: ["one", "two", "three", "four"],
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
    it("Extract an array, with numbers", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: 1,2,3,4
            ---
        `;
        const output = {
            test: [1, 2, 3, 4],
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
    it("Extract an array, mixed", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: one, two,3,4
            ---
        `;
        const output = {
            test: ["one", "two", 3, 4],
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
    it("Extract an url as value", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: http://thisis.a.url
            ---
        `;
        const output = {
            test: "http://thisis.a.url",
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
    it("Extract an url as value, with a comma", () => __awaiter(void 0, void 0, void 0, function* () {
        const input = `---
            test: http://thisis.a.url?var=something,andsomethingelse
            ---
        `;
        const output = {
            test: "http://thisis.a.url?var=something,andsomethingelse",
        };
        const result = yield markdown_meta_1.extractMeta(input);
        expect(result).toStrictEqual(output);
    }));
});
//# sourceMappingURL=markdown-meta.test.js.map