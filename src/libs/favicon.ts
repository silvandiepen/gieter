import { existsSync } from "fs";
import { join } from "path";
import { Payload } from "../types";
import Iconator from "iconator";
import { assetFolder } from "./media";

export const generateFavicon = async (payload: Payload): Promise<Payload> => {
  let favicon = "";
  let dark = "";
  let light = "";

  const assets = join(process.cwd(), `/${assetFolder()}/`);

  const fileExists = (p: string, f: string) => existsSync(join(p, f));

  if (fileExists(assets, "favicon.png")) favicon = `${assetFolder()}/favicon.png`;
  else if (fileExists(assets, "logo.png")) favicon = `${assetFolder()}/logo.png`;

  if (favicon) {
    await Iconator({
      input: favicon,
      output: "public/assets/favicon",
      logging: ["inline", "minimal"],
      sets: ["favicons"],
    });
    favicon = "/assets/favicon/favicon.ico";
  } else {
    favicon = fileExists(assets, "icon.svg") ? `${assetFolder()}/icon.svg` : "";
    light = fileExists(assets, "icon-light.svg") ? `${assetFolder()}/icon-light.svg` : "";
    dark = fileExists(assets, "icon-dark.svg") ? `${assetFolder()}/icon-dark.svg` : "";
  }

  const favicons = {
    default: favicon,
    dark: dark,
    light: light,
  };

  return {
    ...payload,
    favicons,
  };
};
