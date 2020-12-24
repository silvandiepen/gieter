import { existsSync } from "fs";
const { mkdir } = require("fs").promises;

export const asyncForEach = async (array: any, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
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

export const createDir = async (dir): Promise<void> => {
  try {
    !existsSync(dir) && (await mkdir(dir, { recursive: true }));
  } catch (error) {
    console.log(error);
  }
};
export const hello = async (args = {}) => {
  return args;
};
