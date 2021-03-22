import { makeLink } from "./files";

describe("Make Link", () => {
  it("Should return the right url from readme", () => {
    const input = "some/link/to/blabla/readme.md";
    const output = "some/link/to/blabla/index.html";

    const result = makeLink(input);

    expect(result).toStrictEqual(output);
  });
  it("Should return the right url from README", () => {
    const input = "some/link/to/blabla/README.md";
    const output = "some/link/to/blabla/index.html";
    const result = makeLink(input);

    expect(result).toStrictEqual(output);
  });
  it("Should return the right url from index", () => {
    const input = "some/link/to/blabla/index.md";
    const output = "some/link/to/blabla/index.html";
    const result = makeLink(input);

    expect(result).toStrictEqual(output);
  });
  it("Should return the right url from index", () => {
    const input = "some/link/to/blabla/some-test.md";
    const output = "some/link/to/blabla/some-test/index.html";
    const result = makeLink(input);

    expect(result).toStrictEqual(output);
  });
});
