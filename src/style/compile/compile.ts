import { createFile, fileExists } from "@sil/tools";
import { blockLineSuccess, blockMid } from "cli-block";
import { compileAsync } from "sass";
import { join } from "path";

interface StyleFile {
  name: string;
  path: string;
  dest: string;
}

const compileFile = async (file: StyleFile): Promise<void> => {
  const resolvedDest = file.dest;
  const resolvedPath = join(__dirname, "../../../", file.path);
  const result = await compileAsync(resolvedPath);

  await createFile(resolvedDest, result.css.toString());
};

// async

export const buildCss = async (cached = true) => {
  const file = {
    path: "./src/style/app.scss",
    name: "app",
    dest: join(process.cwd(), "dist/app.css"),
  };

  blockMid("styles");

  if (cached) {
    const stylingExists = await fileExists(file.dest);

    if (stylingExists) {
      blockLineSuccess("Styles loaded");
      return;
    }
  }
  await compileFile(file);
  blockLineSuccess(`Styles generated`);
};
