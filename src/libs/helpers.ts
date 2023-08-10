import { File } from "../types";
import { getStringFromTag, removeTag } from "@/libs/tools";
import { camelCase } from "@sil/case";
import { join } from "path";

export const removeTitle = (input: string): string => removeTag(input, "h1");

export const getTitle = (input: string): string =>
  getStringFromTag(input, "h1");

export const fileTitle = (file: File): string =>
  getTitle(file.html) || file.name;

export const getExcerpt = (file: File): string =>
  getStringFromTag(file.html ? file.html : "", "p");

export const flattenObject = (obj: Object, prevKey = "") => {
  const flattened = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, join(prevKey, key, "-")));
    } else {

      
      flattened[camelCase(join(prevKey, key, "-"), { exclude: [':']})] = value;
    }
  });

  return flattened;
};
