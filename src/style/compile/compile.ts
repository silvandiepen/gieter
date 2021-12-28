import { asyncForEach } from "@sil/tools";
import { blockLineSuccess } from "cli-block";
import { compileAsync } from "sass";

const { writeFile } = require("fs").promises;

interface StyleFile {
  name: string;
  file: string;
}

const compileFile = async (file: StyleFile): Promise<void> => {
  const result = await compileAsync(file.file);
  await writeFile(`./dist/style/${file.name}.css`, result.css.toString());
};

export const buildCss = async () => {
  const files = [
    {
      file: "./src/style/app.scss",
      name: "app",
    },
    //   {
    //     file: "./src/style/styles.scss",
    //     name: "styles",
    //   },
  ];

  await asyncForEach(files, async (file) => {
    await compileFile(file);
    blockLineSuccess(`${file.name} generated`);
  });
};
