import { existsSync } from "fs";
const { mkdir, readFile, dirname, writeFile, access, R_OK, W_OK, F_OK } =
  require("fs").promises;

// Node
export const getFileData = async (filePath: string): Promise<string> => {
  try {
    const file = await readFile(filePath).then((res: any) => res.toString());
    return filePath.includes(".json") ? JSON.parse(file) : file;
  } catch (err: any) {
    throw Error(err);
  }
};
export const createDir = async (dir: string): Promise<void> => {
  try {
    !existsSync(dir) && (await mkdir(dir, { recursive: true }));
  } catch (error) {
    console.error(error);
  }
};

export const filesExist = async (
  paths: string[],
  some = false
): Promise<boolean> => {
  const action = some ? asyncSome : asyncEvery;

  try {
    const result = await action(
      paths,
      async (file: string) => await fileExists(file)
    );
    return result;
  } catch (err) {
    return false;
  }
};

export const createFile = async (dest: string, data: string): Promise<void> => {
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, data);
};

// Async
export const asyncFilter = async (arr: any[], predicate: any) => {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
};
export const asyncSome = async (arr: any[], predicate: any) =>
  (await asyncFilter(arr, predicate)).length > 0;
export const asyncEvery = async (arr: any[], predicate: any) =>
  (await asyncFilter(arr, predicate)).length === arr.length;

export const fileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path, R_OK | W_OK | F_OK);
    return true;
  } catch {
    return false;
  }
};
export const hello = async (args: unknown = {}): Promise<unknown> => {
  return args;
};
export async function asyncForEach<T>(
  array: Array<T>,
  callback: (item: T, index: number, og: T[]) => void
): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// Path
export const parentPath = (path: string, goBack = -1): string =>
  path.split("/").slice(0, goBack).join("/");

export const renamePath = (ogLink: string, rename: string) => {
  const pathGroup = ogLink.split("/");
  pathGroup[pathGroup.length - 2] = rename;
  return pathGroup.join("/").toLowerCase();
};

// Strings
export const removeTag = (input: string, tag: string): string => {
  const regex = new RegExp(`<${tag}(.*)>(.*)<\/${tag}>`, "gi");
  return input.replace(regex, "");
};

export const getStringFromTag = (input: string, tag: string): string => {
  const regex = new RegExp(`<${tag}(.*?)>(.+?)<\/${tag}>`, "gi");
  const matches = regex.exec(input);
  return matches && matches.length > 1 ? matches[2] : "";
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
