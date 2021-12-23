import { File } from "../types";
import { getStringFromTag, removeTag } from "@sil/tools";

export const removeTitle = (input: string): string => removeTag(input, "h1");

export const getTitle = (input: string): string =>
  getStringFromTag(input, "h1")[0];

export const fileTitle = (file: File): string =>
  getTitle(file.html) || file.name;
