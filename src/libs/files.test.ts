import { getTitle, removeTitle } from "./helpers";

describe("Remove Title", () => {
  it("Should return the same string", () => {
    const input = `<h2>Some title</h2>   `;
    const output = {
      test: "string",
    };
    const result = removeTitle(input);

    expect(result).toStrictEqual(input);
  });
});
