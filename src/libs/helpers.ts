import { File } from "../types";
// import { getStringFromTag, removeTag } from "@sil/tools";

// Temporary, since I can't update npm now.
export const removeTag = (input: string, tag: string): string => {
  const regex = new RegExp(`<${tag}(.*)>(.*)<\/${tag}>`, "gi");
  return input.replace(regex, "");
};

export const getStringFromTag = (input: string, tag: string): string => {
  const regex = new RegExp(`<${tag}(.*?)>(.+?)<\/${tag}>`, "gi");
  const matches = regex.exec(input);
  return matches && matches.length > 1 ? matches[2] : "";
};

export const removeTitle = (input: string): string => removeTag(input, "h1");

export const getTitle = (input: string): string =>
  getStringFromTag(input, "h1");

export const fileTitle = (file: File): string => {
  return getTitle(file.html) || file.name;
};
