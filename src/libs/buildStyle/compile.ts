import {
  createColorSet,
  cssVariables,
  ColorType,
  ColorData,
} from "@sil/colorset";
import { join } from "path";
const { readFile } = require("fs").promises;

export const loadStyling = async (path: string): Promise<string> => {
  const data = await readFile(path).then((res: any) => res.toString());
  return data;
};

export const buildCss = async (colors: ColorData | null) => {
  const stylingPath = join(__dirname, "../../../dist/style/app.css");

  const baseColors = {
    dark: "#0a0a0a",
    light: "#ffffff",
    primary: "rgb(226, 146, 27)",
    secondary: "rgb(0, 166, 255)",
    ...(colors || {}),
  };

  const darkData = await createColorSet({
    data: baseColors,
    mix: [baseColors.dark, baseColors.light],
    shades: [10, 30, 60, 90],
    type: ColorType.HSLA,
    keepSaturation: true,
  });
  const lightData = await createColorSet({
    data: baseColors,
    mix: [baseColors.light, baseColors.dark],
    shades: [10, 30, 60, 90],
    type: ColorType.HSLA,
    keepSaturation: true,
  });

  const darkMode = cssVariables({ data: darkData });
  const lightMode = cssVariables({ data: lightData });

  const styleData = await loadStyling(stylingPath);

  const findDarkmodeDev = `content: "[DARKMODE]";`;
  const findLightmodeDev = `content: "[LIGHTMODE]";`;
  const findDarkmodeProd = `content:"[DARKMODE]"`;
  const findLightmodeProd = `content:"[LIGHTMODE]"`;

  return styleData
    .replaceAll(findDarkmodeDev, `${darkMode}`)
    .replaceAll(findLightmodeDev, `${lightMode}`)
    .replaceAll(findDarkmodeProd, `${darkMode}`)
    .replaceAll(findLightmodeProd, `${lightMode}`);
};
