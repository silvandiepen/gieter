import { createFile, createDir, fileExists } from "../../libs/tools";
import { blockLineSuccess, blockMid } from "cli-block";
import { compileAsync } from "sass";
import { join, resolve, dirname } from "path";
import { copyFile } from "fs";
const { readFile } = require("fs").promises;

interface StyleFile {
  name: string;
  path: string;
  dest: string;
}

const compileFile = async (file: StyleFile): Promise<void> => {
  const resolvedDest = file.dest;
  const resolvedPath = resolve(join(__dirname, `../../../`, file.path));
  const nodeModulesPath = join(__dirname, `../../../node_modules/`);
  const result = await compileAsync(resolvedPath, {
    loadPaths: [nodeModulesPath],
  });

  await createFile(resolvedDest, result.css.toString());
};

// async

export const loadStyling = async (path: string): Promise<string> => {
  const data = await readFile(path).then((res: any) => res.toString());
  return data;
};

export const buildCss = async (cached = true) => {
  const cacheStylePath = `${process.cwd()}/.cache/app.css`;

  const file = {
    path: "src/style/app.scss",
    name: "app",
    dest: cacheStylePath,
  };

  blockMid("styles");

  const newStylingExists = await fileExists(file.dest);
  const stylingPath = join(__dirname, "../../../dist/style/app.css");
  const stylingExists = await fileExists(stylingPath);
  let styleData = "";

  if (cached) {
    if (newStylingExists) {
      styleData = await loadStyling(file.dest);
    } else if (stylingExists) {
      styleData = await loadStyling(stylingPath);
    }
  }

  if (!styleData) {
    await compileFile(file);
    styleData = await loadStyling(file.dest);
    blockLineSuccess(`Styles generated`);
  } else {
    if (newStylingExists) {
      blockLineSuccess("Styles loaded");
    } else if (stylingExists) {
      await createDir(dirname(cacheStylePath));
      copyFile(stylingPath, cacheStylePath, (err) => {
        if (err) throw err;
      });
      blockLineSuccess("Styles copied and loaded");
    }
  }

  return styleData;
};
