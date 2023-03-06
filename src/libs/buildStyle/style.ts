import { ColorData } from "@sil/colorset";
import { blockLine, blockMid, blockSettings } from "cli-block";
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
  const style = {
    path: "/style/",
    sheet: styleSheet,
    add: "",
    page: "",
    og: "",
  } as Style;
  return { ...payload, style };
};

export const createCss = () => {
  return "";
};
