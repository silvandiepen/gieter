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
});
//# sourceMappingURL=files.test.js.map