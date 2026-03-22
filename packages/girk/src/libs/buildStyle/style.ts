import { ColorData } from "@sil/colorset";
import { blockMid, blockSettings } from "cli-block";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { createDir } from "@girk/utils";
import { Payload, Style } from "../../types";
import { buildCss } from "./compile";

export const getConfigColors = (
  settings: Payload["settings"]
): ColorData | null => {
  if (!settings.config) return null;
  const colors: ColorData = {};
  Object.keys(settings.config).forEach((key: string) => {
    if (!key.startsWith("colors")) return null;
    colors[key.replace("colors", "").toLowerCase()] = settings.config[key];
  });
  return colors;
};

export const generateStyles = async (payload: Payload): Promise<Payload> => {
  const colors = getConfigColors(payload.settings);

  if (colors) {
    blockMid("Config colors");
    blockSettings(colors);
  }

  const styleSheet = await buildCss(colors);
  const styleFile = join(payload.settings.output, "style", "app.css");

  await createDir(dirname(styleFile));
  await writeFile(styleFile, styleSheet);

  const style = {
    path: "/style/app.css",
    sheet: "",
    add: "",
    page: "",
    og: "",
  } as Style;

  if (payload.project.style) {
    style.add = payload.project.style.toString().replace(".scss", ".css");
  }

  if (payload.project.styleOverrule) {
    style.path = payload.project.styleOverrule
      .toString()
      .replace(".scss", ".css");
  }

  return { ...payload, style };
};

export const createCss = () => {
  return "";
};
