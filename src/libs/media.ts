import { join, extname, basename } from "path";
import { existsSync } from "fs";
import { copy } from "fs-extra";
import { blockLineError, blockLineSuccess, blockMid } from "cli-block";
import sharp from "sharp";

import { createFile, getFileTree } from "../libs/files";
import { File, Payload } from "../types";
import { asyncForEach } from "@sil/tools";
import { getSVGData } from "./svg";

import {
  CACHE_DIR,
  CONVERT_MEDIA_EXTENSIONS,
  ALLOWED_MEDIA_EXTENSIONS,
  MEDIA_SIZES,
  MEDIA_SIZE_NAME,
} from "../const";
import { replaceWith } from "./helpers";

export const getThumbnail = (file: File): string | null => {
  const thumbnail =
    file.meta.thumb || file.meta.image || file.meta.icon || null;

  return thumbnail
    ? thumbnail.replace(extname(thumbnail), `.${MEDIA_SIZE_NAME.SMALL}.webp`)
    : null;
};

export const getImagePath = (image: string, size: MEDIA_SIZE_NAME): string =>
  replaceWith(image, CONVERT_MEDIA_EXTENSIONS, `.${size}.webp`);

export const getSvgThumbnail = async (thumb: string): Promise<string> => {
  let svgData = "";
  if (thumb && thumb.endsWith(".svg")) {
    svgData = await getSVGData(thumb);
  }
  return svgData;
};

const resizeFile = async (file: File, size: 0): Promise<Buffer> =>
  await sharp(file.path)
    .resize({ width: size })
    .webp({ lossless: true })
    .toBuffer()
    .then(async (data) => data);

export const getMedia = async (payload: Payload): Promise<File[]> => {
  let mediaFiles: File[] = [];

  await blockMid("Getting all Media files");

  // Get all Media files
  await asyncForEach(["assets", "media"], async (folder: string) => {
    const exists = existsSync(join(process.cwd(), folder));
    if (exists) {
      mediaFiles = [
        ...(await getFileTree(
          join(process.cwd(), folder),
          ALLOWED_MEDIA_EXTENSIONS
        )),
      ];
    }
  });

  // Create all WEBP files in .cache

  await blockMid("Converting media to webp");

  await asyncForEach(
    mediaFiles.filter((f) => CONVERT_MEDIA_EXTENSIONS.includes(f.ext)),
    (file: File) => {
      Object.keys(MEDIA_SIZES).forEach(async (size) => {
        const filename = join(
          CACHE_DIR,
          file.relativePath.replace(
            extname(file.relativePath),
            `.${size.toLowerCase()}.webp`
          )
        );

        if (!existsSync(filename)) {
          const data = await resizeFile(file, MEDIA_SIZES[size]);
          blockLineSuccess(`${basename(filename)} created in cache`);
          await createFile(data, filename);
        } else {
          blockLineSuccess(`${basename(filename)} exists in cache`);
        }
      });
    }
  );

  await blockMid("Copy files - cache to public");

  await copy(CACHE_DIR, payload.settings.output, (err) => {
    // blockLineError(err);
    err
      ? blockLineError("Problem with copying all cache files")
      : blockLineSuccess("copied all files from cache");
  });

  return mediaFiles;
};

export const getLogo = async (
  payload: Payload,
  media: File[]
): Promise<File | null> => {
  let logo: File;

  // Find Logo
  if (!payload.project.logo) {
    const logos = media.filter((l) => l.fileName.toLowerCase() === "logo");

    if (logos.length == 1) {
      logo = logos[0];
    } else if (logos.length > 1) {
      const svg = logos.find((l) => l.ext == ".svg");
      const webp = logos.find((l) => l.ext == ".webp");
      logo = svg || webp;
    }
    if (logo) blockLineSuccess(`found logo ${logo.relativePath}`);
  } else {
    const logoFile = media.find((m) =>
      m.relativePath.includes(payload.project.logo)
    );

    if (logoFile) {
      logo = logoFile;
      blockLineSuccess(`loaded logo ${payload.project.logo}`);
    }
  }

  if (logo && logo.ext == ".svg") {
    logo.data = await getSVGData(logo.relativePath);
  }

  return logo;
};
