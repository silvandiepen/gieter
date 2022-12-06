import { existsSync } from "fs";
import { join } from "path";
import { Payload } from "../types";
import Iconator from "iconator";

export const generateFavicon = async (payload: Payload): Promise<Payload> => {
  let favicon = "";

  const ap = join(process.cwd(), "/assets/");
  const mp = join(process.cwd(), "/media/");

  const ex = (p, f) => existsSync(join(p, f));

  if (ex(ap, "favicon.png")) favicon = "assets/favicon.png";
  else if (ex(mp, "favicon.png")) favicon = "media/favicon.png";
  else if (ex(ap, "logo.png")) favicon = "assets/logo.png";
  else if (ex(mp, "logo.png")) favicon = "media/logo.png";

  if (favicon) {
    await Iconator({
      input: favicon,
      output: "public/assets/favicon",
      logging: ["inline", "minimal"],
      sets: ["favicons"],
    });
    favicon = "/assets/favicon/favicon.ico";
  }

  return { ...payload, favicon };
};
