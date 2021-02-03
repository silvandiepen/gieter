"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
describe("Remove Title", () => {
    it("Should return the same string", () => {
        const input = `<h2>Some title</h2>   `;
        const output = {
            test: "string",
        };
        const result = helpers_1.removeTitle(input);
        expect(result).toStrictEqual(input);
    });
    it("Should return the string without the title", () => {
        const input = `<h1>Some title</h1><h2>Some title</h2>`;
        const output = `<h2>Some title</h2>`;
        const result = helpers_1.removeTitle(input);
        expect(result).toStrictEqual(output);
    });
    it("Should return the string without the title with attributes", () => {
        const input = `<h1 id="something">Some title</h1><h2>Some title</h2>`;
        const output = `<h2>Some title</h2>`;
        const result = helpers_1.removeTitle(input);
        expect(result).toStrictEqual(output);
    });
});
describe("Get Title", () => {
    it("Should return an empty string", () => {
        const input = `<h2>Some title</h2>   `;
        const output = "";
        const result = helpers_1.getTitle(input);
        expect(result).toStrictEqual(output);
    });
    it("Should return an empty string", () => {
        const input = `<h1>Some title</h1>`;
        const output = "Some title";
        const result = helpers_1.getTitle(input);
        expect(result).toStrictEqual(output);
    });
});
//# sourceMappingURL=helpers.test.js.map