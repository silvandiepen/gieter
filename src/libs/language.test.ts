import {
  getLangFromFilename,
  getLangFromPath,
  fixLangInPath,
} from "./language";

import { Language } from "../types";

describe("Language in fileName", () => {
  it("Should return the correct language", () => {
    const input = `index.md`;
    const result = getLangFromFilename(input);

    expect(result).toStrictEqual(Language.EN);
  });
  it("Should return the correct language", () => {
    const input = `index:nl.md`;
    const result = getLangFromFilename(input);

    expect(result).toStrictEqual(Language.NL);
  });
});

describe("Language in path", () => {
  it("Should return the correct language", () => {
    const input = `test/index.md`;
    const result = getLangFromPath(input);

    expect(result).toStrictEqual(Language.EN);
  });
  it("Should return the correct language", () => {
    const input = `test/index:nl.md`;
    const result = getLangFromPath(input);

    expect(result).toStrictEqual(Language.NL);
  });
  it("Should return the correct language", () => {
    const input = `test:nl/index.md`;
    const result = getLangFromPath(input);

    expect(result).toStrictEqual(Language.NL);
  });
  it("Should return the correct language", () => {
    const input = `test:nl/index:es.md`;
    const result = getLangFromPath(input);

    expect(result).toStrictEqual(Language.NL);
  });
});
describe("Correct the language in path", () => {
  it("Should return a default language path back", () => {
    const input = `test/index.md`;
    const output = `test/index.md`;
    const result = fixLangInPath(input);

    expect(result).toStrictEqual(output);
  });
  it("Should return a NL language path back", () => {
    const input = `test/index:nl.md`;
    const output = `nl/test/index.md`;
    const result = fixLangInPath(input);

    expect(result).toStrictEqual(output);
  });
  it("Should return a NL language path back", () => {
    const input = `test:nl/index.md`;
    const output = `nl/test/index.md`;
    const result = fixLangInPath(input);

    expect(result).toStrictEqual(output);
  });
});
