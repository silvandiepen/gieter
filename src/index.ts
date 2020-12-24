#!/usr/bin/env node
"use strict";

import { toHtml } from "./libs/markdown";
import { asyncForEach, createDir, hello } from "./libs/helpers";
import { getFiles, buildHtml, makePath, download } from "./libs/files";
import { MarkdownFile, Payload, Settings } from "./types";

const { readFile, writeFile } = require("fs").promises;
const { existsSync } = require("fs");
import { copy } from "fs-extra";

import { join } from "path";
import * as log from "cli-block";

/*

  Files

*/
const files = async (payload: Payload): Promise<Payload> => {
  const files = await getFiles(process.cwd());
  let project = {};

  await asyncForEach(files, async (file, index) => {
    const html = await toHtml(file.data).then((r) => r);
    files[index] = { ...file, html: html };
    // Merge configs

    Object.keys(html.meta).forEach((meta) => {
      if (meta.includes("project")) {
        project[meta.toLowerCase().replace("project", "")] = html.meta[meta];
      }
    });
  });

  if (Object.keys(project).length) {
    log.BLOCK_MID("Project settings");
    log.BLOCK_SETTINGS(project);
  }

  return { ...payload, files: files, project };
};

/*

  Settings

*/
const settings = async (payload: Payload): Promise<Payload> => {
  const settings: Settings = {
    output: join(process.cwd(), "public"),
  };

  return { ...payload, settings };
};

/*

  Styles

*/
const styles = async (payload: Payload): Promise<Payload> => {
  // Download the style
  await download(
    "https://stil.style/default.css",
    join(__dirname, "../dist/style.css")
  );

  const styleData = await readFile(
    join(__dirname, "../dist/style.css")
  ).then((res: any) => res.toString());

  if (payload.files.length > 1) {
    await createDir(payload.settings.output);
    const filePath = join(payload.settings.output, "style.css");
    await writeFile(filePath, styleData);

    return { ...payload, style: null };
  } else {
    return { ...payload, style: styleData };
  }
};

const menu = async (payload: Payload): Promise<Payload> => {
  const menu = payload.files
    .map((file) => ({
      name: file.html?.meta?.title || file.name,
      path: makePath(file.path),
      active: !!!file.html.meta.hide,
    }))
    .filter((item) => item.active);
  log.BLOCK_MID("Navigation");

  let menuItems = {};
  menu.forEach((item) => {
    menuItems[item.name] = item.path;
  });
  await log.BLOCK_SETTINGS(menuItems);

  return { ...payload, menu };
};
/*

  Build

*/

const build = async (payload: Payload): Promise<Payload> => {
  log.BLOCK_MID("Pages");
  await asyncForEach(payload.files, async (file: MarkdownFile) => {
    const html = await buildHtml(file, {
      menu: payload.menu,
      style: payload.style,
      project: payload.project,
    });
    const fileName = makePath(file.path);

    await createDir(
      join(payload.settings.output, fileName.split("/").slice(0, -1).join(""))
    );
    try {
      await writeFile(join(payload.settings.output, fileName), html);
      log.BLOCK_LINE_SUCCESS(`${file.name} created → ${fileName}`);
    } catch (err) {
      throw Error(err);
    }
  });
  return { ...payload };
};

const media = async (payload: Payload): Promise<Payload> => {
  await asyncForEach(["assets", "media"], async (folder: string) => {
    const exists = await existsSync(join(process.cwd(), folder));

    if (exists) {
      await copy(join(process.cwd(), folder), payload.settings.output)
        .then(
          async () => await log.BLOCK_LINE_SUCCESS(`Copied ${folder} folder`)
        )
        .catch((err) => console.error(err));
    }
  });

  return payload;
};

hello()
  .then(settings)
  .then((s) => {
    log.BLOCK_START("Open Letter");
    return s;
  })
  .then(files)
  .then(styles)
  .then(menu)
  .then(build)
  .then(media)
  .then(() => {
    log.BLOCK_END();
  });
