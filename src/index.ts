#!/usr/bin/env node
"use strict";

const { readFile, writeFile } = require("fs").promises;
const { existsSync } = require("fs");

import { copy } from "fs-extra";
import { join } from "path";
import * as log from "cli-block";

// import { PurgeCSS } from "purgecss";

import { toHtml } from "./libs/markdown";
import { asyncForEach, hello, fileTitle } from "./libs/helpers";
import {
  getFiles,
  getFileTree,
  makeLink,
  getProjectConfig,
  getFileData,
} from "./libs/files";
import { cleanupSvg, replaceImageSvg } from "./libs/svg";
import { File, Payload, Settings, Project, Tag } from "./types";
import { createPage, createApiPage } from "./libs/page";
import { generateStyles } from "./libs/style";

const PackageJson = require("../package.json");

/*
 * Files
 */
export const files = async (payload: Payload): Promise<Payload> => {
  let files = await getFiles(process.cwd(), ".md");
  let project: Project = {};

  await asyncForEach(files, async (file: File, index: number) => {
    // Compile file to html
    const rendered = await toHtml(file.data).then((r) => r);

    const document = await replaceImageSvg(rendered.document);

    files[index] = {
      ...file,
      html: document,
      meta: rendered.meta,
    };

    const projectMeta = getProjectConfig(rendered.meta);
    Object.keys(projectMeta).forEach((key) => {
      if (!project[key]) project[key] = projectMeta[key];
    });
  });

  // Define if the page is home

  await asyncForEach(files, async (file: File, index: number) => {
    const relativePath = file.path.replace(process.cwd(), "");
    const pathGroup = relativePath.split("/");

    const isHome =
      pathGroup[pathGroup.length - 1].toLowerCase().includes("readme") ||
      pathGroup[pathGroup.length - 1].toLowerCase().includes("index");

    files[index].home = isHome;
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

export const menu = async (payload: Payload): Promise<Payload> => {
  let menu = payload.files
    .map((file) => {
      let active = file.meta.hide !== "true" || file.meta.hide;

      const relativePath = file.path.replace(process.cwd(), "");
      const pathGroup = relativePath.split("/");
      const depth = pathGroup.length - 2;

      // Only items from the main depth sholud be in the menu
      if (depth > 0) active = false;

      // Index in first depth can also be in menu
      if (depth === 1 && file.home) active = true;

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
      if (file.home) {
        children = payload.files
          .filter((item) => item.parent == file?.meta?.type && !item.home)
          // //  Enrich each child with meta information and a link
          .map((item) => ({
            // ...item,
            title: item.title,
            created: item?.meta?.date || item.created,
            meta: { ...item.meta, hide: true },
            link: makeLink(item.path),
          }))
          .sort((a, b) => {
            return b.created - a.created;
          });
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
    if (file.meta && file.meta?.tags) {
      for (let i = 0; i < file.meta.tags.length; i++) {
        let parent = payload.files.find((f) => f.name == file.parent);

        let tag = {
          name: file.meta.tags[i],
          parent: file.parent,
          type: parent?.meta.type || "",
        };
        if (
          !tags.some(
            (item) => item.name === tag.name && item.parent === tag.parent
          )
        )
          tags.push(tag);
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

  // Get Siblings

  await asyncForEach(payload.files, async (file: File) => {});

  // Create Content pages

  await asyncForEach(
    payload.files,
    async (file: File) => await createPage(payload, file)
  );

  // Create API
  await asyncForEach(
    payload.files,
    async (file: File) => await createApiPage(payload, file)
  );
  return { ...payload };
};

export const tagPages = async (payload: Payload): Promise<Payload> => {
  if (payload.tags.length) log.BLOCK_MID("Tag pages");

  await asyncForEach(payload.tags, async (tag: Tag) => {
    const file: File = {
      name: tag.name,
      title: `#${tag.name}`,
      path: `tag/${tag.parent}/${tag.name}/index.html`,
      created: new Date(),
      fileName: "index.html",
      parent: tag.parent,
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

// export const reduceCss = async (payload: Payload): Promise<Payload> => {
//   // const content = ["./public/index.html"];
//   // const css = payload.style.sheet;

//   // const options = {
//   //   output: "./public/purified.css",
//   //   minify: true,
//   //   rejected: true,
//   // };

//   // purify(content, css, options);

//   console.log(payload.files[0].html);

//   const purgeCSSResult = await new PurgeCSS().purge({
//     content: ["./public/index.html"],
//     // content: [
//     //   {
//     //     raw: payload.files[0].html,
//     //     extension: "html",
//     //   },
//     // ],
//     css: ["public/*.css"],
//     fontFace: true,
//     keyframes: true,
//     variables: true,
//     // rejected: true,
//   });
//   console.log(purgeCSSResult);
//   return payload;
// };

hello()
  .then(settings)
  .then((s) => {
    log.BLOCK_START(`Open Letter ${PackageJson.version}`);
    return s;
  })
  .then(files)
  .then(media)
  .then(tags)
  .then(archives)
  .then(menu)
  .then(generateStyles)
  .then(contentPages)
  .then(tagPages)
  // .then(reduceCss)
  .then(() => {
    log.BLOCK_END();
  });
