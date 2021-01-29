#!/usr/bin/env node
"use strict";

import { toHtml } from "./libs/markdown";
import { asyncForEach, createDir, hello } from "./libs/helpers";
import {
  getFiles,
  getFileTree,
  buildHtml,
  makePath,
  download,
  getProjectConfig,
  getFileData,
} from "./libs/files";
import { cleanupSvg } from "./libs/svg";
import { File, Payload, Settings, Project, Style } from "./types";

const { readFile, writeFile } = require("fs").promises;
const { existsSync } = require("fs");
import { copy } from "fs-extra";

import { join } from "path";
import * as log from "cli-block";

/*

  Files

*/
export const files = async (payload: Payload): Promise<Payload> => {
  let files = await getFiles(process.cwd(), ".md");
  let project: Project = {};

  await asyncForEach(files, async (file: File, index: number) => {
    // Compile file to html
    const html = await toHtml(file.data).then((r) => r);
    files[index] = { ...file, html: html };

    const projectMeta = getProjectConfig(html.meta);
    Object.keys(projectMeta).forEach((key) => {
      if (!project[key]) project[key] = projectMeta[key];
    });
  });

  // Filter files
  if (project?.ignore) {
    files = files.filter(
      (file) => !project.ignore.some((ignore) => file.path.includes(ignore))
    );
  }
  if (project?.logo && project?.logo.includes(".svg")) {
    const logoData = await getFileData({
      name: "",
      path: join(process.cwd(), project.logo),
      relativePath: project.logo,
    });
    try {
      const svgFile = cleanupSvg(logoData);
      project.logoData = svgFile;
    } catch (err) {
      console.log(err);
    }
  }

  if (Object.keys(project).length) {
    log.BLOCK_MID("Project settings");
    log.BLOCK_SETTINGS(project, {}, { exclude: ["logoData"] });
  }

  return { ...payload, files: files, project };
};

/*

  Settings

*/
export const settings = async (payload: Payload): Promise<Payload> => {
  const settings: Settings = {
    output: join(process.cwd(), "public"),
  };

  return { ...payload, settings };
};

/*

  Styles

*/
export const styles = async (payload: Payload): Promise<Payload> => {
  // Download the style
  let style: Style = {};

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
    style.path = "/style.css";
  } else {
    style.sheet = styleData;
  }

  if (payload.project.styleOverrule) style.path = payload.project.styleOverrule;
  if (payload.project.style) style.add = payload.project.style;

  return { ...payload, style };
};

export const menu = async (payload: Payload): Promise<Payload> => {
  payload.files.forEach((file) => {
    console.log(file.html.meta);
  });

  let menu = payload.files
    .map((file) => ({
      name: file.html?.meta?.title || file.name,
      path: makePath(file.path),
      active: !!!file.html.meta.hide,
    }))
    .filter((item) => item.active);

  console.log(menu);
  log.BLOCK_MID("Navigation");

  let menuItems = {};
  if (menu.length > 1)
    menu.forEach((item) => {
      menuItems[item.name] = item.path;
    });

  if (menu.length < 2) {
    await log.BLOCK_LINE("No menu");
    menu = [];
  } else await log.BLOCK_SETTINGS(menuItems);

  return { ...payload, menu };
};
/*

  Build

*/

export const build = async (payload: Payload): Promise<Payload> => {
  log.BLOCK_MID("Pages");
  await asyncForEach(payload.files, async (file: File) => {
    const data = {
      menu: payload.menu,
      style: payload.style,
      project: payload.project,
      media: payload.media,
    };

    const html = await buildHtml(file, data);
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

export const media = async (payload: Payload): Promise<Payload> => {
  let mediaFiles: File[] = [];
  await asyncForEach(["assets", "media"], async (folder: string) => {
    const exists = await existsSync(join(process.cwd(), folder));

    if (exists) {
      await copy(
        join(process.cwd(), folder),
        join(payload.settings.output, folder)
      )
        .then(
          async () => await log.BLOCK_LINE_SUCCESS(`Copied ${folder} folder`)
        )
        .catch((err) => console.error(err));

      mediaFiles = [
        ...(await getFileTree(join(process.cwd(), folder), ".svg")),
      ];
    }
  });

  return { ...payload, media: mediaFiles };
};

hello()
  .then(settings)
  .then((s) => {
    log.BLOCK_START("Open Letter");
    return s;
  })
  .then(files)
  .then(styles)
  .then(media)
  .then(menu)
  .then(build)
  .then(() => {
    log.BLOCK_END();
  });
