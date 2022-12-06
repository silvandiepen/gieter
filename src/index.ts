#!/usr/bin/env node
"use strict";

import { join } from "path";
import {
  blockMid,
  blockHeader,
  blockFooter,
  blockSettings,
  blockLineSuccess,
} from "cli-block";
import { hello, asyncForEach } from "@sil/tools";

import { toHtml } from "./libs/markdown";
import { fileTitle } from "./libs/helpers";
import {
  createThumbnails,
  getLogo,
  getMedia,
  getSvgThumbnail,
} from "./libs/media";
import { processPartials } from "./libs/partials";
import { getFiles } from "./libs/files";
import { getProjectData } from "./libs/project";
import { File, Payload, Settings, Project } from "./types";
import { createPage } from "./libs/page";
import { generateTags, createTagPages } from "./libs/tags";
import { generateStyles } from "./libs/style";
import { generateMenu } from "./libs/menu";
import { generateArchives } from "./libs/archives";
import { generateFavicon } from "./libs/favicon";
import { getThumbnail } from "./libs/media";

const PackageJson = require("../package.json");

/*
 * Files
 */
export const files = async (payload: Payload): Promise<Payload> => {
  let files = await getFiles(process.cwd(), ".md");
  // const project: Project = {};

  /*
   * Languages
   */
  const languages = [];
  for (let i = 0; i < files.length; i++) {
    if (!languages.includes(files[i].language))
      languages.push(files[i].language);
  }

  /*
   * Generate all files into html and extract metadata
   */
  await asyncForEach(files, async (file: File, index: number) => {
    const rendered = await toHtml(file.data).then((r) => r);

    files[index] = {
      ...file,
      html: rendered.document,
      meta: rendered.meta,
    };
  });

  const project: Project = await getProjectData(files);

  /*
   * When the file is a "home" file, it gets certain privileges
   */
  await asyncForEach(files, async (file: File, index: number) => {
    const relativePath = file.path.replace(process.cwd(), "");
    const pathGroup = relativePath.split("/");

    const thePath = pathGroup[pathGroup.length - 1].toLowerCase();
    const isHome = thePath.includes("readme") || thePath.includes("index");

    files[index].home = isHome;
  });

  /*
   * Inherit Parent Metadata
   */
  await asyncForEach(files, async (file: File, index: number) => {
    // const parentName =
    //   file.parent && file.name !== file.parent ? file.parent : "";
    // const parent = files.find((file) => file.name === parentName);

    const title = file.meta?.title ? file.meta.title : fileTitle(file);
    files[index].title = title.toString();
  });

  /*
   * Set the thumbnail for each file
   */
  await asyncForEach(files, async (file: File, index: number) => {
    const thumbnail = getThumbnail(file);
    const thumbnailSvg = await getSvgThumbnail(thumbnail);

    files[index].thumbnail = thumbnail;
    files[index].thumbnailSvg = thumbnailSvg;
  });

  /*
   * Filter ignored files
  
   * Can't be done directly, due to that project Settings can be given on any file. So all files need to be indexed before
   * filtering can happen.
   */
  if (project?.ignore)
    files = files.filter(
      (file) => !project.ignore.some((ignore) => file.path.includes(ignore))
    );



  /*
   * Logging
   */
  if (Object.keys(project).length) {
    blockMid("Project settings");
    blockSettings(project, {}, { exclude: ["logoData"] });
  }

  return {
    ...payload,
    files: files,
    project,
    languages,
  };
};

/*
 *  Settings
 */
export const settings = async (payload: Payload): Promise<Payload> => {
  const settings: Settings = {
    output: join(process.cwd(), "public"),
    languages: [],
  };

  return { ...payload, settings };
};

/*
 *  Build
 */

export const contentPages = async (payload: Payload): Promise<Payload> => {
  if (payload.languages.length > 1) {
    // Create Content pages
    await asyncForEach(payload.languages, async (language) => {
      blockMid(`Pages ${language}`);

      await asyncForEach(
        payload.files
          .filter((file: File) => file.language == language)
          .filter((file: File) => !file.name.startsWith("-")), // Don't pages that start with a -
        async (file: File) => await createPage(payload, file)
      );
    });
  } else {
    blockMid("Pages");

    await asyncForEach(
      payload.files.filter((file: File) => !file.name.startsWith("-")), // Don't pages that start with a -
      async (file: File) => await createPage(payload, file)
    );
  }

  return { ...payload };
};

export const media = async (payload: Payload): Promise<Payload> => {
  const media = await getMedia(payload);
  const logo: File = await getLogo(payload, media);

  await createThumbnails(payload);

  return { ...payload, media, logo };
};

hello()
  .then(settings)
  .then((s) => {
    blockHeader(`Gieter ${PackageJson.version}`);
    return s;
  })
  .then(files)
  .then(processPartials)
  .then(media)
  .then(generateTags)
  .then(generateArchives)
  .then(generateMenu)
  .then(generateStyles)
  .then(generateFavicon)
  .then(contentPages)
  .then(createTagPages)
  .then(() => {
    blockFooter();
  });
