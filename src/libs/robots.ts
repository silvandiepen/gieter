import { writeFile } from "@sil/tools/dist/lib/system";
import { blockLineSuccess } from "cli-block";
import { join } from "path";
import { Payload } from "../types";

export const createRobots = async (payload: Payload): Promise<Payload> => {
  if (payload.config?.noRobots) return payload;

  const robotsTxt = `User-agent: *
Allow: /`;
  const outputFile = join(payload.settings.output, "robots.tx");
  await writeFile(outputFile, robotsTxt);

  blockLineSuccess("Created robots.txt");
  return payload;
};
