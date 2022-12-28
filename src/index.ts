#!/usr/bin/env node
"use strict";

import { join } from "path";
import { blockMid, blockHeader, blockFooter, blockSettings } from "cli-block";
import { hello, asyncForEach } from "@sil/tools";
import { getArgs } from "@sil/args";

import { toHtml } from "./libs/markdown";
import { fileTitle } from "./libs/helpers";
import {
  copyToAssets,
  createThumbnails,
  getLogo,
  getMedia,
  getSvgThumbnail,
} from "./libs/media";
import { processPartials } from "./libs/partials";
import { getFiles } from "./libs/files";
import { getConfig, getProjectData } from "./libs/project";
import { File, Payload, Settings, Project } from "./types";
import { createPage } from "./libs/page";
import { generateTags, createTagPages } from "./libs/tags";
import { generateStyles } from "./libs/style";
import { generateMenu } from "./libs/menu";
import { generateArchives } from "./libs/archives";
import { generateFavicon } from "./libs/favicon";
import { getThumbnail } from "./libs/media";

import { getLanguageName } from "./libs/language";
import { createRobots } from "./libs/robots";

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

    files[index].home = isHome ? isHome && file.meta.archive : false;
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
export const settingsAndConfig = async (payload: Payload): Promise<Payload> => {
  const args = getArgs();
  const config = await getConfig();

  const settings: Settings = {
    output: join(process.cwd(), "public"),
    languages: [],
    args,
    config,
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
      blockMid(`Pages ${getLanguageName(language)}`);

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
  await copyToAssets(payload);

  return { ...payload, media, logo };
};
const removeUrlParts = (payload: Payload): Payload => {
  payload.files = payload.files.map((file) => {
    return {
      ...file,
      id: file.id.replace("-src-", "-"),
      relativePath: file.relativePath.replace("/src/", "/"),
      path: file.path.replace("/src/", "/"),
    };
  });

  return payload;
};

hello()
  .then(settingsAndConfig)
  .then((s) => {
    blockHeader(`Gieter ${PackageJson.version}`);
    return s;
  })
  .then((s) => {
    s.settings.args &&
      Object.keys(s.settings.args).length &&
      blockSettings(s.settings.args);
    s.settings.config &&
      Object.keys(s.settings.config).length &&
      blockSettings(s.settings.config);
    return s;
  })
  .then(files)
  .then(removeUrlParts)
  .then(processPartials)
  .then(media)
  .then(generateTags)
  .then(generateArchives)
  .then(generateMenu)
  .then(generateStyles)
  .then(generateFavicon)
  .then(contentPages)
  .then(createTagPages)
  .then(createRobots)
  .then(() => {
    blockFooter();
  });