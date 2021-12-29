import { File } from "../types";
import { getStringFromTag, removeTag } from "@sil/tools";

export const removeTitle = (input: string): string => removeTag(input, "h1");

export const getTitle = (input: string): string =>
  getStringFromTag(input, "h1")[0];

export const fileTitle = (file: File): string =>
  getTitle(file.html) || file.name;

export const asyncFilter = async (arr: any[], predicate: any) => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
};
export const asyncSome = async (arr: any[], predicate: any) =>
  (await asyncFilter(arr, predicate)).length > 0;
export const asyncEvery = async (arr: any[], predicate: any) =>
  (await asyncFilter(arr, predicate)).length === arr.length;
