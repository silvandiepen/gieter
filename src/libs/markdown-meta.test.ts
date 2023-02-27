import { extractMeta } from "@/libs/markdown-meta";

describe("Extract Metadata", () => {
  it("Extract simple string", async () => {
    const input = `---
            test: string
            ---
        `;
    const output = {
      test: "string",
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
  it("Extract multiple string", async () => {
    const input = `---
            test: string
            second: value
            ---
        `;
    const output = {
      test: "string",
      second: "value",
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
  it("Extract number", async () => {
    const input = `---
            test: 3
            ---
        `;
    const output = {
      test: 3,
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
  it("Extract number and string", async () => {
    const input = `---
            test: 3
            test2: value
            ---
        `;
    const output = {
      test: 3,
      test2: "value",
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
  it("Extract an array", async () => {
    const input = `---
            test: one,two,three,four
            ---
        `;
    const output = {
      test: ["one", "two", "three", "four"],
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
  it("Extract an array, with numbers", async () => {
    const input = `---
            test: 1,2,3,4
            ---
        `;
    const output = {
      test: [1, 2, 3, 4],
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
  it("Extract an array, mixed", async () => {
    const input = `---
            test: one, two,3,4
            ---
        `;
    const output = {
      test: ["one", "two", 3, 4],
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
  it("Extract an url as value", async () => {
    const input = `---
            test: http://thisis.a.url
            ---
        `;
    const output = {
      test: "http://thisis.a.url",
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
  it("Extract an url as value, with a comma", async () => {
    const input = `---
            test: http://thisis.a.url?var=something,andsomethingelse
            ---
        `;
    const output = {
      test: "http://thisis.a.url?var=something,andsomethingelse",
    };
    const result = await extractMeta(input);

    expect(result).toStrictEqual(output);
  });
});
