import { asyncForEach } from "@sil/tools";
import { blockLine, blockLineSuccess, blockMid } from "cli-block";
import { compileAsync } from "sass";
import { filesExist } from "../../libs/files";
import { join } from "path";

const { writeFile, access, R_OK, W_OK, F_OK } = require("fs").promises;

interface StyleFile {
  name: string;
  path: string;
  dest: string;
}

const compileFile = async (file: StyleFile): Promise<void> => {
  const resolvedDest = join(__dirname, "../../../", file.dest);
  const resolvedPath = join(__dirname, "../../../", file.path);
  const result = await compileAsync(resolvedPath);

  await writeFile(resolvedDest, result.css.toString());
};

// async

export const buildCss = async (cached = true) => {
  const files = [
    {
      path: "./src/style/app.scss",
      name: "app",
      dest: ".cache/app.css",
    },
    //   {
    //     file: "./src/style/styles.scss",
    //     name: "styles",
    //   },
  ];

  blockMid("styles");
  if (cached) {
    const destPaths = [];
    files.forEach((file) => destPaths.push(file.dest));

    if (await filesExist(destPaths)) {
      blockLineSuccess("Styles already generated");
      return;
    }
  }

  await asyncForEach(files, async (file) => {
    await compileFile(file);
    blockLineSuccess(`${file.name} generated`);
  });
};
