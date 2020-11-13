#!/usr/bin/env node
"use strict";

import { toHtml } from "./libs/markdown";
import { getFiles, buildHtml, makePath } from "./libs/files";
import { MarkdownFile, Payload } from "./types";
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

  const menu = payload.files.map((file) => {
    return {
      name: file.name,
      path: makePath(file.path),
    };
  });

  const outputFolder = join(process.cwd(), "public");

  await asyncForEach(payload.files, async (file: MarkdownFile) => {
    const html = await buildHtml(file, menu);
    const fileName = makePath(file.path);
    const fileDir = join(
      outputFolder,
      fileName.split("/").slice(0, -1).join("")
    );

    try {
      !existsSync(fileDir) && mkdirSync(fileDir, { recursive: true });
    } catch (error) {
      console.log(error);
    }

    await writeFile(join(outputFolder, fileName), html, async () => {
      await log.BLOCK_LINE_SUCCESS(`${file.name} created → ${fileName}`);
    });
  });
  return { ...payload };
};

const hello = async () => {
  log.BLOCK_START("Building your vue");
  return {};
};

const stop = async () => {
  log.BLOCK_END();
};

hello()
  .then(files)
  .then(async (s) => await build(s))
  .then(stop);
