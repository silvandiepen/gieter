const { writeFile } = require("fs").promises;
import { join } from "path";
import * as log from "cli-block";

import { Payload, File } from "../types";
import { makeLink, buildHtml } from "./files";
import { createDir } from "./helpers";

export const createPage = async (
  payload: Payload,
  file: File
): Promise<void> => {
  const data = {
    menu: payload.menu,
    style: payload.style,
    project: payload.project,
    media: payload.media,
    tags: payload.tags,
  };
  const html = await buildHtml(file, data);
  const fileName = makeLink(file.path);

  await createDir(
    join(payload.settings.output, fileName.split("/").slice(0, -1).join("/"))
  );
  try {
    await writeFile(join(payload.settings.output, fileName), html);
    log.BLOCK_LINE_SUCCESS(`${file.name} created → ${fileName}`);
  } catch (err) {
    throw Error(err);
  }
};
