#!/usr/bin/env node
"use strict";

const { readFile, writeFile } = require("fs").promises;
const { existsSync } = require("fs");
import { copy } from "fs-extra";
import { join } from "path";
import * as log from "cli-block";

import { toHtml } from "./libs/markdown";
import { asyncForEach, createDir, hello, fileTitle } from "./libs/helpers";
import {
  getFiles,
  getFileTree,
  makeLink,
  download,
  getProjectConfig,
  getFileData,
} from "./libs/files";
import { cleanupSvg } from "./libs/svg";
import { File, Payload, Settings, Project, Style, Tag } from "./types";
import { createPage } from "./libs/page";

/*
 * Files
 */
export const files = async (payload: Payload): Promise<Payload> => {
  let files = await getFiles(process.cwd(), ".md");
  let project: Project = {};

  await asyncForEach(files, async (file: File, index: number) => {
    // Compile file to html
    const rendered = await toHtml(file.data).then((r) => r);
    files[index] = { ...file, html: rendered.document, meta: rendered.meta };

    const projectMeta = getProjectConfig(rendered.meta);
    Object.keys(projectMeta).forEach((key) => {
      if (!project[key]) project[key] = projectMeta[key];
    });
  });

  // Inherit Parent Metadata
  await asyncForEach(files, async (file: File, index: number) => {
    const parentName =
      file.parent && file.name !== file.parent ? file.parent : "";
    const parent = files.find((file) => file.name === parentName);

    files[index].title = file.meta?.title ? file.meta.title : fileTitle(file);
  });

  // Filter files
  if (project?.ignore)
    files = files.filter(
      (file) => !project.ignore.some((ignore) => file.path.includes(ignore))
    );

  if (project?.logo && project?.logo.includes(".svg")) {
    const logoData = await getFileData({
      name: "",
      fileName: "",
      created: null,
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
 *  Settings
 */
export const settings = async (payload: Payload): Promise<Payload> => {
  const settings: Settings = {
    output: join(process.cwd(), "public"),
  };

  return { ...payload, settings };
};

/*
 * Styles
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
  let menu = payload.files
    .map((file) => {
      let active = file.meta.hide !== "true" || file.meta.hide;

      if (file.parent !== file.name) active = false;
      return {
        name: file.title,
        link: makeLink(file.path),
        active,
      };
    })
    .filter((item) => item.active);

  log.BLOCK_MID("Navigation");

  let menuItems = {};
  if (menu.length > 1)
    menu.forEach((item) => {
      menuItems[item.name] = item.link;
    });

  if (menu.length < 2) {
    await log.BLOCK_LINE("No menu");
    menu = [];
  } else await log.BLOCK_SETTINGS(menuItems);

  return { ...payload, menu };
};

/*
 *  Archives
 */

export const archives = async (payload: Payload): Promise<Payload> => {
  payload.files = payload.files

    // Map all Archive parents and get their children
    .map((file) => {
      let children = [];
      if (file.parent == file.name) {
        children = payload.files
          .filter(
            (item) => item.parent == file.name && item.parent !== item.name
          )

          // //  Enrich each child with meta information and a link
          .map((item) => ({
            ...item,
            meta: { ...item.meta, hide: true },
            link: makeLink(item.path),
          }));
      }
      return {
        ...file,
        children,
      };
    });

  return payload;
};
/*
 *  Tags
 */

export const tags = async (payload: Payload): Promise<Payload> => {
  const tags: Tag[] = [];

  await asyncForEach(payload.files, (file: File) => {
    if (file.meta.tags) {
      for (let i = 0; i < file.meta.tags.length; i++) {
        let parent = payload.files.find((f) => f.name == file.parent);
        let tag = {
          name: file.meta.tags[i],
          parent: file.parent,
          type: parent.meta?.type,
        };
        if (!tags.includes(tag)) tags.push(tag);
      }
    }
  });
  return { ...payload, tags };
};

/*
 *  Build
 */

export const contentPages = async (payload: Payload): Promise<Payload> => {
  log.BLOCK_MID("Pages");
  await asyncForEach(
    payload.files,
    async (file: File) => await createPage(payload, file)
  );
  return { ...payload };
};

export const tagPages = async (payload: Payload): Promise<Payload> => {
  log.BLOCK_MID("Tag pages");

  await asyncForEach(payload.tags, async (tag: Tag) => {
    const file: File = {
      name: tag.name,
      title: `#${tag.name}`,
      path: `tag/${tag.name}/index.html`,
      created: new Date(),
      fileName: "index.html",
      meta: { type: tag.type },
      children: payload.files.filter(
        (file) =>
          file.meta?.tags?.includes(tag.name) && file.parent == tag.parent
      ),
      html: `${tag.parent}`,
    };
    await createPage(payload, file);
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
  .then(tags)
  .then(archives)
  .then(menu)
  .then(contentPages)
  .then(tagPages)
  .then(() => {
    log.BLOCK_END();
  });
