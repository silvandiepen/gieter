import { existsSync } from "fs";
const { mkdir } = require("fs").promises;
import { File } from "../types";

export async function asyncForEach<T>(
  array: Array<T>,
  callback: (item: T, index: number, og: T[]) => void
): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export const getIndexes = (source: string, find: string): number[] => {
  const result = [];
  let i = 0;

  while (i < source.length) {
    if (source.substring(i, i + find.length) === find) {
      result.push(i);
      i += find.length;
    } else {
      i++;
    }
  }

  return result;
};

export const nthIndex = (source: string, find: string, nth: number): number => {
  const result = getIndexes(source, find);
  return result[nth];
};

export const createDir = async (dir: string): Promise<void> => {
  try {
    !existsSync(dir) && (await mkdir(dir, { recursive: true }));
  } catch (error) {
    console.error(error);
  }
};

export const hello = async (args: unknown = {}): Promise<unknown> => {
  return args;
};

export const removeTitle = (input: string): string =>
  input.replace(/<h1(.*)>(.*)<\/h1>/gi, "");

export const getTitle = (input: string): string => {
  const matches = /<h1(.*?)>(.+?)<\/h1>/gi.exec(input);
  if (!matches) return "";
  return matches[matches.length - 1];
};

export const fileTitle = (file: File): string =>
  getTitle(file.html) || file.name;
