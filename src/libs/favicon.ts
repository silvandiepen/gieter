import { existsSync } from "fs";
import { join } from "path";
import { Payload } from "../types";
import Iconator from "iconator";

export const generateFavicon = async (payload: Payload): Promise<Payload> => {
  let favicon = "";

  const iconPath = join(process.cwd(), "/assets/");
  if (existsSync(join(iconPath, "favicon.png"))) favicon = "assets/favicon.png";
  else if (existsSync(join(iconPath, "logo.png"))) favicon = "assets/logo.png";

  if (favicon)
    await Iconator({
      input: favicon,
      output: "public/assets/favicon",
      logging: ["inline", "minimal"],
      sets: ["favicons"],
      meta: ["none"],
    });

  return { ...payload, favicon };
};
