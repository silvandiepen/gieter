#!/usr/bin/env node
"use strict";

import { toHtml } from "./libs/markdown";
import { getFiles, buildHtml } from "./libs/files";
import { Payload } from "./types";
import { asyncForEach } from "./libs/helpers";
import { existsSync, mkdirSync, writeFile } from "fs";
import { join } from "path";
import * as log from "cli-block";

const files = async (payload: Payload) => {
  const files = await getFiles(process.cwd());

  await asyncForEach(files, async (file, index) => {
    const html = await toHtml(file.data).then((r) => r);
    files[index] = { ...file, html: html };
  });

  return { ...payload, files: files };
};

const build = async (payload: Payload) => {
  // Create an output folder

  const outputFolder = join(process.cwd(), "build");
  if (!existsSync(outputFolder)) {
    mkdirSync(outputFolder);
  }
  await asyncForEach(payload.files, async (file) => {
    const html = await buildHtml(file);

    const filename =
      payload.files.length > 1 ? `${file.name}.html` : `index.html`;

    await writeFile(join(outputFolder, filename), html, async () => {
      await log.BLOCK_LINE_SUCCESS(`${file.name} created → ${filename}`);
    });
  });
  return { ...payload };
};

const hello = async () => {
  log.BLOCK_START("Building your letter");
  return {};
};
const stop = async () => {
  log.BLOCK_END();
};

hello()
  .then(files)
  .then(async (s) => await build(s))
  .then(stop);
