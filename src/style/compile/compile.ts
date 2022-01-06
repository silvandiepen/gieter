import { createFile, createDir, fileExists } from "@sil/tools";
import { blockLineSuccess, blockMid } from "cli-block";
import { renderSync } from "sass";
import { join, resolve, dirname} from "path";
import { copyFile } from "fs";

interface StyleFile {
  name: string;
  path: string;
  dest: string;
}

const compileFile = async (file: StyleFile): Promise<void> => {
  const resolvedDest = file.dest;
  const resolvedPath = resolve(join(__dirname, `../../../`, file.path));
  const nodeModulesPath = join(__dirname, `../../../node_modules/`);
  const result = await renderSync({
    file: resolvedPath,
    includePaths: [nodeModulesPath],
  });

  await createFile(resolvedDest, result.css.toString());
};

// async

export const buildCss = async (cached = true) => {

  const cacheStylePath = `${process.cwd()}/.cache/app.css`;

  const file = {
    path: "src/style/app.scss",
    name: "app",
    dest: cacheStylePath,
  };

  blockMid("styles");

  if (cached) {
    const newStylingExists = await fileExists(file.dest);
    const stylingPath = join(__dirname, "../../../dist/style/app.css");
    const stylingExists = await fileExists(stylingPath);

    if (newStylingExists) {
      blockLineSuccess("Styles loaded");
      return;
    } else if (stylingExists) {
      createDir(dirname(cacheStylePath));
      copyFile(
        stylingPath,
        cacheStylePath,
        (err) => {
          if (err) throw err;
        }
      );
      blockLineSuccess("Styles copied and loaded");
      return;
    }
  }
  await compileFile(file);
  blockLineSuccess(`Styles generated`);
};
