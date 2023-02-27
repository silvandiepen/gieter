import { join, extname, basename, resolve } from "path";
import { copyFile, existsSync, lstatSync } from "fs";
import { copy, writeFile, copySync } from "fs-extra";
import { blockLineError, blockLineSuccess } from "cli-block";
import sharp from "sharp";

import { getFileTree } from "../libs/files";
import { File, Payload } from "../types";
import { asyncForEach } from "@sil/tools";
import { createDir } from "@sil/tools/dist/lib/system";
import { getSVGData } from "./svg";

export const getThumbnail = (file: File): string | null => {
  const thumb = file.meta.thumb;
  const image = file.meta.image;
  // const icon = file.meta.icon;

  // const thumbnail = thumb || image || icon || null;
  const thumbnail = thumb || image || null;
  return thumbnail;
};

export const getSvgThumbnail = async (thumb: string): Promise<string> => {
  let svgData = "";
  if (thumb && thumb.endsWith(".svg")) {
    svgData = await getSVGData(thumb);
  }
  return svgData;
};

export const createThumbnails = async (payload: Payload): Promise<Payload> => {
  await asyncForEach(payload.files, async (file) => {
    await createThumbnail(file);
  });

  return payload;
};

export const resizeImage = async (image: string): Promise<void> => {
  const imageUrl = join(process.cwd(), image);
  const exists = existsSync(imageUrl);

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

  const thumbExists = existsSync(path);
  if (thumbExists) return;

  const imageExists = existsSync(imageUrl);
  if (imageExists) {
    await sharp(imageUrl)
      .resize({ width: 640 })
      .toBuffer()
      .then(async (data) => {
        await createDir(path.replace(basename(path), ""));
        await writeFile(path, data);
        blockLineSuccess(`created ${image} thumbnail`);
      });
  } else {
    blockLineError(`${imageUrl} does not exist`);
  }
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
    const exists = existsSync(join(process.cwd(), folder));

    if (exists) {
      await copy(
        join(process.cwd(), folder),
        join(payload.settings.output, folder)
      )
        .then(() => blockLineSuccess(`Copied ${folder} folder`))
        .catch((err) => console.error(err));

      mediaFiles = [
        ...(await getFileTree(join(process.cwd(), folder), [
          ".svg",
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".mp3",
          ".wav",
          ".otf",
          ".ttf",
          ".woff",
        ])),
      ];
    }
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
      const png = logos.find((l) => l.ext == ".png");
      const jpg = logos.find((l) => l.ext == ".jpg");
      const gif = logos.find((l) => l.ext == ".gif");
      logo = svg || png || jpg || gif;
    }
    if (logo) {
      blockLineSuccess(`found logo ${logo.relativePath}`);
    }
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

const toArray = (value: string | string[]): string[] => {
  if (typeof value !== "string") return value;
  return [value];
};

export const assetFolder = (): string => {
  const exists = existsSync(join(process.cwd(), "media"));
  return exists ? "media" : "assets";
};

export const copyToAssets = async (payload: Payload): Promise<void> => {
  const copyFiles = payload.project.copyFiles;

  if (!copyFiles) return;

  await asyncForEach(toArray(copyFiles), async (file) => {
    const assets = assetFolder();

    const input = join(process.cwd(), file);
    const output = join(payload.settings.output, assets, basename(file));

    try {
      await createDir(output.replace(basename(output), ""));

      if (lstatSync(file).isDirectory()) {
        copySync(input, output, { overwrite: true });
      } else {
        copyFile(input, output, (err) => {
          if (err) throw err;
        });
      }

      blockLineSuccess(`${file} copied to ${assets}/${basename(file)}`);
    } catch (err) {
      blockLineError(err);
    }
  });
};
