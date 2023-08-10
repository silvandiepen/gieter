import { getStringFromTag, removeTag } from "./strings";

test("Get title from html - simple", () => {
  expect(getStringFromTag("<h1>Amsterdam</h1>", "h1")).toEqual("Amsterdam");
});

test("Get title from html - multiple", () => {
  expect(
    getStringFromTag("<h1>Amsterdam</h1><h1>Something else</h1>", "h1")
  ).toEqual("Amsterdam");
});

test("Get title from html - with tags", () => {
  expect(
    getStringFromTag(
      '<h1 id="Amsterdammmie">Amsterdam</h1><h1>Something else</h1>',
      "h1"
    )
  ).toEqual("Amsterdam");
});

test("Remove a tag from html", () => {
  expect(removeTag("<h1>Amsterdam</h1>", "h1")).toEqual("");
});
