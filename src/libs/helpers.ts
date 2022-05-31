import { File } from "../types";
import { getStringFromTag, removeTag } from "@sil/tools";

export const removeTitle = (input: string): string => removeTag(input, "h1");

export const spanToParagraph = (input: string): string => input.replace('<p>','<p><span>').replace('</p>','</span></p>');

export const getTitle = (input: string): string =>
  getStringFromTag(input, "h1");

export const fileTitle = (file: File): string =>
  getTitle(file.html) || file.name;

export const getExcerpt = (file: File): string =>
  getStringFromTag(file.html ? file.html : "", "p");
