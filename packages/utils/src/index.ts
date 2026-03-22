import { existsSync } from "node:fs";
import { access, mkdir, readFile } from "node:fs/promises";

export async function asyncForEach<T>(
  array: T[],
  callback: (item: T, index: number, original: T[]) => unknown | Promise<unknown>
): Promise<void> {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

export async function hello(args: any = {}): Promise<any> {
  return args;
}

export function removeTag(input: string, tag: string): string {
  const regex = new RegExp(`<${tag}(.*)>(.*)</${tag}>`, "gi");
  return input.replace(regex, "");
}

export function getStringFromTag(input: string, tag: string): string {
  const regex = new RegExp(`<${tag}(.*?)>(.+?)</${tag}>`, "gi");
  const matches = regex.exec(input);
  return matches && matches.length > 1 ? matches[2] : "";
}

function getIndexes(source: string, find: string): number[] {
  const result: number[] = [];
  let index = 0;

  while (index < source.length) {
    if (source.substring(index, index + find.length) === find) {
      result.push(index);
      index += find.length;
    } else {
      index += 1;
    }
  }

  return result;
}

export function nthIndex(source: string, find: string, nth: number): number {
  return getIndexes(source, find)[nth];
}

export function parentPath(path: string, goBack = -1): string {
  return path.split("/").slice(0, goBack).join("/");
}

export function renamePath(originalPath: string, rename: string): string {
  const pathGroup = originalPath.split("/");
  pathGroup[pathGroup.length - 2] = rename;
  return pathGroup.join("/").toLowerCase();
}

export async function createDir(dir: string): Promise<void> {
  try {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getFileData<T = string>(filePath: string): Promise<T> {
  const file = await readFile(filePath, "utf8");
  return (filePath.includes(".json") ? JSON.parse(file) : file) as T;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
