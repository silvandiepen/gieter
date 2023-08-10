import { existsSync } from "fs";
import { dirname } from "path";
import { asyncEvery, asyncForEach, asyncSome } from "./async";
import { mkdir, readFile, access, writeFile, R_OK, F_OK, W_OK } from "fs-extra";

export const createDir = async (dir: string): Promise<void> => {
  try {
    !existsSync(dir) && (await mkdir(dir, { recursive: true }));
  } catch (error) {
    console.error(error);
  }
};

export const getFileData = async (filePath: string): Promise<string> => {
  try {
    const file = await readFile(filePath).then((res: any) => res.toString());
    return filePath.includes(".json") ? JSON.parse(file) : file;
  } catch (err: any) {
    throw Error(err);
  }
};

export const getJsonData = async (filePath: string): Promise<{}> => {
  const data = await getFileData(filePath);
  return JSON.parse(data);
};

export const fileExists = async (path: string): Promise<boolean> => {
  try {
    await access(path, R_OK | W_OK | F_OK);
    return true;
  } catch {
    return false;
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

export const existingFiles = async (paths: string[]): Promise<string[]> => {
  const existingPaths: string[] = [];
  await asyncForEach(paths, async (path) => {
    const exists = await fileExists(path);
    if (exists) existingPaths.push(path);
  });
  return existingPaths;
};

export const createFile = async (dest: string, data: string): Promise<void> => {
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, data);
};
