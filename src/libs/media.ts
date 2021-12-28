import { join, extname, basename } from "path";
import { existsSync } from "fs";
import { copy, writeFile } from "fs-extra";
import { blockLineError, blockLineSuccess } from "cli-block";
import sharp from "sharp";

import { getFileTree } from "../libs/files";
import { File, Payload } from "../types";
import { asyncForEach, createDir } from "@sil/tools";

export const getThumbnail = (file: File) => {
  return file.meta?.thumbnail
    ? file.meta.thumbnail
    : file.meta?.image
    ? file.meta.image
    : null;
};

export const createThumbnails = async (payload: Payload): Promise<Payload> => {
  await asyncForEach(payload.files, async (file) => {
    await createThumbnail(file);
  });
  return payload;
};

export const resizeImage = async (image: string): Promise<void> => {
  const imageUrl = join(process.cwd(), image);
  const exists = await existsSync(imageUrl);

  if (!exists) {
    blockLineError(`${image} does not exist`);
    return;
  }
  const ext = extname(image);

  const path = join(
    process.cwd(),
    ".cache",
    image.replace(ext, `.thumb${ext}`)
  );

  // const thumbExists = await existsSync(path);
  // if (thumbExists) return;

  await sharp(imageUrl)
    .resize({ width: 640 })
    .toBuffer()
    .then((data) => {
      // console.log(path.replace(basename(path), ""));
      createDir(path.replace(basename(path), ""));
      writeFile(path, data);
      blockLineSuccess(`created ${image} thumbnail`);
    });
};

export const createThumbnail = async (file: File): Promise<any> => {
  if (file.meta.image) {
    const ext = extname(file.meta.image);
    if (ext === ".jpg" || ext === ".png") resizeImage(file.meta.image);
  }

  if (file.meta.thumbnail) {
    const ext = extname(file.meta.thumbnail);
    if (ext === ".jpg" || ext === ".png") resizeImage(file.meta.thumbnail);
  }
};

export const getMedia = async (payload: Payload): Promise<File[]> => {
  let mediaFiles: File[] = [];
  await asyncForEach(["assets", "media"], async (folder: string) => {
    const exists = await existsSync(join(process.cwd(), folder));

    if (exists) {
      await copy(
        join(process.cwd(), folder),
        join(payload.settings.output, folder)
      )
        .then(() => blockLineSuccess(`Copied ${folder} folder`))
        .catch((err) => console.error(err));

      mediaFiles = [
        ...(await getFileTree(join(process.cwd(), folder), ".svg")),
      ];
    }
  });
  return mediaFiles;
};
